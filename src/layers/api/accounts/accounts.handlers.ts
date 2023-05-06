import { validationResult } from 'express-validator'
import currency from 'currency.js'
import fuzzysort from 'fuzzysort'
import { startOfDay, endOfDay, format } from 'date-fns'
import { v4 as uuid } from 'uuid'
import { faker } from '@faker-js/faker'
import groupBy from 'lodash/groupBy'

// Helpers
import {
  getNordigenInstitutions,
  getNordigenAccountTransactions,
  getNordigenAccountMeta,
  getNordigenInstitution,
  getNordigenAccountBalances,
  getNordigenAccountDetails,
  getNordigenRequisitions,
  createNordigenAgreement,
  createNordigenRequisition,
} from '@layers/nordigen/nordigen.utils'

import {
  getUserAccountWithAccountId,
  getUserAccounts,
  createUserAccount,
  deleteUserAccount,
} from '@layers/database/database.utils'

// Types
import { ServerError, ServerRequest, ServerResponse } from '@global/types'
import {
  CreateAccountRequisitionBody,
  GetAvailableAccountsParams,
  GetAccountTransactionsParams,
  GetAccountTransactionsQuery,
  GetAccountTransactionsGroupedParams,
  CreateAccountBody,
  DeleteAccountBody,
  ReducedGroupedTransactions,
} from '@layers/api/accounts/accounts.types'

// Constants
import { MOCKED_USER_ID, NORDIGEN_CURRENCY, FORMATTED_CURRENCY } from '@global/constants'

// Mocks
import { mockedTransactions } from '@mocks/mockedTransactions'

const nordigenCurrency = (value: string) => currency(value, NORDIGEN_CURRENCY)

export const getAccountInstitutions = async (req: ServerRequest, res: ServerResponse) => {
  const { data: institutions } = await getNordigenInstitutions()

  res.json({
    success: true,

    data: institutions.map(({ id, name, logo }) => ({
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

  // MOCKED

  if (res.locals.userId === MOCKED_USER_ID) {
    res.json({
      success: true,

      data: {
        url: `${redirect}?ref=${uuid()}`,
      },
    })

    return
  }

  // MOCKED

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

  // MOCKED

  if (res.locals.userId === MOCKED_USER_ID) {
    res.json({
      success: true,

      data: [
        {
          accountId: '40204295-8519-4594-a07a-4cc40a8e0952',
          accountName: 'Fake Account',
          accountIban: 'DK7050516477944871',
          accountBalance: '20.000,00',
          bankLogo: 'https://cdn.nordigen.com/ais/DANSKEBANK_BUSINESS_DABADKKK.png',
        },
      ],
    })

    return
  }

  // MOCKED

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

  // MOCKED
  if (res.locals.userId === MOCKED_USER_ID) {
    const mockedAccounts = []

    for (const account of data) {
      mockedAccounts.push({
        accountId: account.account_id,
        accountBalance: '20.000,00',
        accountName: account.account_name,
        accountIban: account.account_iban,
        bankName: account.bank_name,
        bankLogo: account.bank_logo,
      })
    }

    res.json({
      success: true,

      data: mockedAccounts,
    })

    return
  }
  // MOCKED

  const accounts = []

  for (const account of data) {
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

  res.json({
    success: true,
    data: accounts,
  })
}

export const createAccount = async (req: ServerRequest<CreateAccountBody>, res: ServerResponse) => {
  validationResult(req).throw()

  const { accountId } = req.body

  const { userId } = res.locals

  // MOCKED

  if (userId === MOCKED_USER_ID) {
    await createUserAccount({
      userId,
      accountId,
      accountName: 'Studiekonto',
      accountIban: faker.finance.iban(true, 'DK'),
      bankName: 'Fake Bank',
      bankLogo: 'https://cdn.nordigen.com/ais/DANSKEBANK_BUSINESS_DABADKKK.png',
    })

    res.json({
      success: true,
    })

    return
  }

  // MOCKED

  const { data: accountDetails } = await getNordigenAccountDetails({ accountId })
  const { data: accountMeta } = await getNordigenAccountMeta({ accountId })
  const { data: bankInfo } = await getNordigenInstitution({ institutionId: accountMeta.institution_id })

  await createUserAccount({
    userId,
    accountId,
    accountName: accountDetails.account.name,
    accountIban: accountDetails.account.iban,
    bankName: bankInfo.name,
    bankLogo: bankInfo.logo,
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
  const { search, category, intervals } = req.query

  // MOCKED
  const isMock = res.locals.userId === MOCKED_USER_ID

  const mockedTransactionsObject = {
    data: mockedTransactions,
  }

  const mockedCurrentBalance = '20000.00'
  const mockedBalanceObject = {
    data: {
      balances: [
        {
          balanceAmount: {
            amount: mockedCurrentBalance,
          },
        },
      ],
    },
  }
  // MOCKED

  const accounts = await getUserAccountWithAccountId({ userId: res.locals.userId, accountId })
  const account = accounts[0]

  if (!account) {
    throw new ServerError(403)
  }

  const { data: transactionsInfo } = !isMock
    ? await getNordigenAccountTransactions({
        accountId: account.account_id,
      })
    : mockedTransactionsObject

  const { data: balances } = !isMock
    ? await getNordigenAccountBalances({ accountId: account.account_id })
    : mockedBalanceObject

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

  const intervalizedTransactions: { id: string; transactions: Array<object> }[] = []

  for (const interval of intervals) {
    let intervalizedTransaction = mappedTransactions.filter((transaction) => {
      const transactionDate = transaction.date
      const fromDate = startOfDay(new Date(parseInt(interval.from))).getTime()
      const endDate = endOfDay(new Date(parseInt(interval.to))).getTime()

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
      { pattern: /mobilepay/i, category: 'Transfers' }, // lønoverførsel belongs to Utilities

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

    intervalizedTransactions.push({
      id: interval.id,
      transactions: intervalizedTransaction.sort((prev, next) => prev.weight - next.weight),
    })
  }

  res.json({
    success: true,
    data: intervalizedTransactions,
  })
}

export const getAccountTransactionsGroupedHandler = async (
  req: ServerRequest<unknown, GetAccountTransactionsGroupedParams>,
  res: ServerResponse
) => {
  validationResult(req).throw()

  const { accountId } = req.params

  // MOCKED
  const isMock = res.locals.userId === MOCKED_USER_ID
  const mockedTransactionsObject = {
    data: mockedTransactions,
  }
  // MOCKED

  const accounts = await getUserAccountWithAccountId({ userId: res.locals.userId, accountId })
  const account = accounts[0]

  if (!account) {
    throw new ServerError(403)
  }

  const { data: transactionsInfo } = !isMock
    ? await getNordigenAccountTransactions({
        accountId: account.account_id,
      })
    : mockedTransactionsObject

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

  await deleteUserAccount({ userId, accountId })

  res.json({
    success: true,
  })
}
