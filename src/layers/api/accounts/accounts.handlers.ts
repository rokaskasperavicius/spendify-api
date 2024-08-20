import { faker } from '@faker-js/faker'
import { isAxiosError } from 'axios'
import currency from 'currency.js'
import { endOfDay, format, startOfDay } from 'date-fns'
import { validationResult } from 'express-validator'
import fuzzysort from 'fuzzysort'
import { StatusCodes } from 'http-status-codes'
import groupBy from 'lodash/groupBy'
import { v4 as uuid } from 'uuid'

import { FORMATTED_CURRENCY, NORDIGEN_CURRENCY } from '@/global/constants'
import { ServerError, ServerRequest, ServerResponse } from '@/global/types'

import {
  CreateAccountBody,
  CreateAccountRequisitionBody,
  DeleteAccountBody,
  GetAccountInstitutionsReq,
  GetAccountTransactionsGroupedParams,
  GetAccountTransactionsParams,
  GetAccountTransactionsQuery,
  GetAvailableAccountsParams,
  ReducedGroupedTransactions,
} from '@/layers/api/accounts/accounts.types'
import {
  createUserAccount,
  deleteUserAccount,
  getUserAccountWithAccountId,
  getUserAccounts,
} from '@/layers/database/database.utils'
import prisma from '@/layers/database/db'
import {
  createNordigenAgreement,
  createNordigenRequisition,
  getNordigenAccountBalances,
  getNordigenAccountDetails,
  getNordigenAccountMeta,
  getNordigenAccountTransactions,
  getNordigenInstitution,
  getNordigenInstitutions,
  getNordigenRequisitions,
} from '@/layers/nordigen/nordigen.utils'

const nordigenCurrency = (value: string) => currency(value, NORDIGEN_CURRENCY)

export const getAccountInstitutions = async (req: GetAccountInstitutionsReq, res: ServerResponse) => {
  const { data: institutions } = await getNordigenInstitutions()
  const { query } = req.query

  const searchResults = query
    ? fuzzysort.go(query, institutions, { key: 'name' }).map((search) => search.obj)
    : institutions

  res.json({
    success: true,

    data: searchResults.map(({ id, name, logo }) => ({
      id: id,
      bankName: name,
      bankLogo: logo,
    })),
  })
}

export const createAccountRequisition = async (
  req: ServerRequest<CreateAccountRequisitionBody>,
  res: ServerResponse
) => {
  validationResult(req).throw()

  const { institutionId, redirect } = req.body

  const { data: bankInfo } = await getNordigenInstitution({ institutionId })

  const { data: agreement } = await createNordigenAgreement({
    institutionId,
    maxHistoricalDays: bankInfo.transaction_total_days,
  })

  const { data: requisition } = await createNordigenRequisition({
    redirect,
    institutionId,
    agreementId: agreement.id,
  })

  res.json({
    success: true,

    data: {
      url: requisition.link,
    },
  })
}

export const getAvailableAccounts = async (
  req: ServerRequest<object, GetAvailableAccountsParams>,
  res: ServerResponse
) => {
  validationResult(req).throw()

  const { requisitionId } = req.params

  const { data } = await getNordigenRequisitions({ requisitionId })

  const accounts = []

  for (const accountId of data.accounts) {
    const { data: accountMeta } = await getNordigenAccountMeta({ accountId })
    const { data: bankInfo } = await getNordigenInstitution({ institutionId: accountMeta.institution_id })

    const { data: details } = await getNordigenAccountDetails({ accountId })
    const { data: balances } = await getNordigenAccountBalances({ accountId })

    accounts.push({
      accountId,
      accountName: details.account.name,
      accountIban: details.account.iban,
      bankLogo: bankInfo.logo,
      accountBalance: nordigenCurrency(balances.balances[0].balanceAmount.amount).format(FORMATTED_CURRENCY),
    })
  }

  res.json({
    success: true,
    data: accounts,
  })
}

export const getAccounts = async (req: ServerRequest, res: ServerResponse) => {
  const data = await getUserAccounts({ userId: res.locals.userId })

  const accounts = []
  let someExpired = false
  let accountId

  try {
    for (const account of data) {
      accountId = account.account_id

      const { data: balances } = await getNordigenAccountBalances({ accountId: account.account_id })

      accounts.push({
        accountId: account.account_id,
        accountBalance: nordigenCurrency(balances.balances[0].balanceAmount.amount).format(FORMATTED_CURRENCY),
        accountName: account.account_name,
        accountIban: account.account_iban,
        bankName: account.bank_name,
        bankLogo: account.bank_logo,
      })
    }
  } catch (err) {
    if (isAxiosError(err)) {
      const { detail } = err.response?.data || {}

      // Expired account
      if (accountId && typeof detail === 'string' && detail?.includes('expired')) {
        someExpired = true

        // Remove it from the system???
        await prisma.accounts.deleteMany({
          where: {
            account_id: accountId,

            AND: {
              user_id: res.locals.userId,
            },
          },
        })
        accountId = undefined
      }
    }
  }

  res.json({
    success: true,
    data: {
      someExpired,
      accounts,
    },
  })
}

export const createAccount = async (req: ServerRequest<CreateAccountBody>, res: ServerResponse) => {
  validationResult(req).throw()

  const { accountId } = req.body
  const { userId } = res.locals

  const { data: accountDetails } = await getNordigenAccountDetails({ accountId })
  const { data: accountMeta } = await getNordigenAccountMeta({ accountId })
  const { data: bankInfo } = await getNordigenInstitution({ institutionId: accountMeta.institution_id })

  await prisma.accounts.create({
    data: {
      user_id: userId,
      account_id: accountId,
      account_name: accountDetails.account.name,
      account_iban: accountDetails.account.iban,
      bank_name: bankInfo.name,
      bank_logo: bankInfo.logo,
    },
  })

  res.json({
    success: true,
  })
}

export const getAccountTransactions = async (
  req: ServerRequest<object, GetAccountTransactionsParams, GetAccountTransactionsQuery>,
  res: ServerResponse
) => {
  validationResult(req).throw()

  const { accountId } = req.params
  const { search, category, from, to } = req.query

  const account = await prisma.accounts.findFirst({
    where: {
      account_id: accountId,
      AND: {
        user_id: res.locals.userId,
      },
    },
  })

  if (!account) {
    throw new ServerError(StatusCodes.BAD_REQUEST)
  }

  const { data: transactionsInfo } = await getNordigenAccountTransactions({
    accountId: account.account_id,
  })

  const { data: balances } = await getNordigenAccountBalances({ accountId: account.account_id })

  const transactions = transactionsInfo.transactions.booked
  let currentBalance = balances.balances[0].balanceAmount.amount

  // Map cumulative balance
  let mappedTransactions = transactions.map((transaction, index) => {
    // Skip first transaction
    if (index !== 0) {
      const prevTransactionAmount = transactions[index - 1].transactionAmount.amount

      currentBalance = nordigenCurrency(currentBalance).subtract(prevTransactionAmount).format()
    }

    const title = transaction.remittanceInformationUnstructuredArray
      ? transaction.remittanceInformationUnstructuredArray[0]
      : transaction.remittanceInformationUnstructured

    return {
      id: transaction.transactionId,
      weight: index,
      title: title || '',
      date: new Date(transaction.valueDate).getTime(),
      category: '',
      amount: nordigenCurrency(transaction.transactionAmount.amount).format(FORMATTED_CURRENCY),
      amountInt: nordigenCurrency(transaction.transactionAmount.amount).value,
      totalAmount: nordigenCurrency(currentBalance).format(FORMATTED_CURRENCY),
      totalAmountInt: nordigenCurrency(currentBalance).value,
    }
  })

  // Apply fuzzysort
  mappedTransactions = search
    ? fuzzysort.go(search, mappedTransactions, { key: 'title', threshold: -400 }).map((search) => search.obj)
    : mappedTransactions

  let intervalizedTransaction = mappedTransactions.filter((transaction) => {
    const transactionDate = transaction.date
    const fromDate = startOfDay(new Date(parseInt(from))).getTime()
    const endDate = endOfDay(new Date(parseInt(to))).getTime()

    return transactionDate >= fromDate && transactionDate <= endDate
  })

  const rules = [
    // Food & Groceries
    { pattern: /rema|rema1000/i, category: 'Food & Groceries' },
    { pattern: /fakta/i, category: 'Food & Groceries' },
    { pattern: /kvickly/i, category: 'Food & Groceries' },
    { pattern: /superbrugsen/i, category: 'Food & Groceries' },
    { pattern: /coop/i, category: 'Food & Groceries' },
    { pattern: /irma/i, category: 'Food & Groceries' },
    { pattern: /aldi/i, category: 'Food & Groceries' },
    { pattern: /lidl/i, category: 'Food & Groceries' },
    { pattern: /bilka/i, category: 'Food & Groceries' },
    { pattern: /økomarket/i, category: 'Food & Groceries' },
    { pattern: /netto/i, category: 'Food & Groceries' },
    { pattern: /meny/i, category: 'Food & Groceries' },
    { pattern: /føtex|foetex/i, category: 'Food & Groceries' },
    { pattern: /7-eleven/i, category: 'Food & Groceries' },
    { pattern: /wolt/i, category: 'Food & Groceries' },
    { pattern: /just eat/i, category: 'Food & Groceries' },
    { pattern: /kiosk/i, category: 'Food & Groceries' },
    { pattern: /cafeteria/i, category: 'Food & Groceries' },
    { pattern: /bakery/i, category: 'Food & Groceries' },

    // Transfers
    { pattern: /\boverførsel\b/i, category: 'Transfers' }, // lønoverførsel belongs to Utilities
    { pattern: /mobilepay/i, category: 'Transfers' },

    // Everything else belongs to Utilities
  ]

  // Apply categories
  intervalizedTransaction = intervalizedTransaction.map((transaction) => {
    const rule = rules.find((rule) => transaction.title.match(rule.pattern))

    return {
      ...transaction,
      category: rule?.category || 'Utilities',
    }
  })

  intervalizedTransaction = intervalizedTransaction.filter(
    (transaction) => !category || transaction.category === category
  )

  res.json({
    success: true,
    data: intervalizedTransaction.sort((prev, next) => prev.weight - next.weight),
  })
}

export const getAccountTransactionsGroupedHandler = async (
  req: ServerRequest<unknown, GetAccountTransactionsGroupedParams>,
  res: ServerResponse
) => {
  validationResult(req).throw()

  const { accountId } = req.params

  const accounts = await getUserAccountWithAccountId({ userId: res.locals.userId, accountId })
  const account = accounts[0]

  if (!account) {
    throw new ServerError(403)
  }

  const { data: transactionsInfo } = await getNordigenAccountTransactions({
    accountId: account.account_id,
  })

  const transactions = transactionsInfo.transactions.booked

  const groupedTransactions = groupBy(transactions, (transaction) =>
    format(new Date(transaction.valueDate), 'MMMM, yyyy')
  )

  const reducedTransactions = Object.keys(groupedTransactions).reduce(
    (acc: Array<ReducedGroupedTransactions>, value) => {
      let expenses = 0
      let income = 0

      groupedTransactions[value].forEach((transaction) => {
        const amount = transaction.transactionAmount.amount
        const amountInt = nordigenCurrency(amount).value

        if (amountInt < 0) {
          expenses += amountInt * -1
        } else {
          income += amountInt
        }
      })

      acc.push({
        date: value,
        expenses: currency(expenses).format(FORMATTED_CURRENCY),
        expensesInt: expenses,

        income: currency(income).format(FORMATTED_CURRENCY),
        incomeInt: income,
      })

      return acc
    },
    []
  )

  res.json({
    success: true,
    data: reducedTransactions,
  })
}

export const deleteAccountHandler = async (req: ServerRequest<DeleteAccountBody>, res: ServerResponse) => {
  validationResult(req).throw()

  const { userId } = res.locals
  const { accountId } = req.body

  await prisma.accounts.deleteMany({
    where: {
      account_id: accountId,
      AND: {
        user_id: userId,
      },
    },
  })

  res.json({
    success: true,
  })
}
