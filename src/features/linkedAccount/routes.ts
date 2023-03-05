import 'express-async-errors'

import express from 'express'

import { validationResult } from 'express-validator'
import currency from 'currency.js'
import fuzzysort from 'fuzzysort'
import { BayesClassifier } from 'natural'
import { startOfDay, endOfDay } from 'date-fns'

// Helpers
import { db } from '@services/db'

import { getNordigenInstitutions } from '@features/nordigen/utils/getNordigenInstitutions'
import { createNordigenAgreement } from '@features/nordigen/utils/createNordigenAgreement'
import { createNordigenRequisition } from '@features/nordigen/utils/createNordigenRequisition'
import { getNordigenRequisitions } from '@features/nordigen/utils/getNordigenRequisitions'
import { getNordigenAccountDetails } from '@features/nordigen/utils/getNordigenAccountDetails'
import { getNordigenAccountBalances } from '@features/nordigen/utils/getNordigenAccountBalances'
import { getNordigenInstitution } from '@features/nordigen/utils/getNordigenInstitution'
import { getNordigenAccountMeta } from '@features/nordigen/utils/getNordigenAccountMeta'
import { getNordigenAccountTransactions } from '@features/nordigen/utils/getNordigenAccountTransactions'

import { getLinkedAccounts } from '@features/linkedAccount/utils/getLinkedAccounts'
import { getLinkedAccount } from '@features/linkedAccount/utils/getLinkedAccount'

import { verifyUser } from '@features/users/utils/verifyUser'

// Schemas
import {
  createRequisition,
  getAvailableAccounts,
  linkAccount,
  getAccountTransactions,
} from '@features/linkedAccount/schemas'

// Types
import { ServerError, ServerRequest, ServerResponse } from '@types'
import {
  CreateRequisition,
  GetAvailableAccounts,
  ConnectLinkedAccount,
  LinkedAccountTransactionQuery,
  LinkedAccountTransactionParams,
} from '@features/linkedAccount/routes.types'

const app = express.Router()

app.get('/institutions', async (req: ServerRequest, res: ServerResponse) => {
  const { data: institutions } = await getNordigenInstitutions()

  res.json({
    success: true,

    data: institutions.map(({ id, name, logo }) => ({
      id: id,
      bankName: name,
      bankLogo: logo,
    })),
  })
})

app.post(
  '/create-requisition',
  verifyUser,
  createRequisition,
  async (req: ServerRequest<CreateRequisition>, res: ServerResponse) => {
    validationResult(req).throw()

    const { institutionId, redirect } = req.body

    const { data: agreement } = await createNordigenAgreement({ institutionId })

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
)

app.get(
  '/available-accounts/:requisitionId',
  verifyUser,
  getAvailableAccounts,
  async (req: ServerRequest<object, GetAvailableAccounts>, res: ServerResponse) => {
    validationResult(req).throw()

    const { requisitionId } = req.params

    const { data } = await getNordigenRequisitions({ requisitionId })

    const accounts = []

    for (const accountId of data.accounts) {
      const { data: details } = await getNordigenAccountDetails({ accountId })
      const { data: balances } = await getNordigenAccountBalances({ accountId })

      accounts.push({
        requisitionId,
        accountId,
        accountName: details.account.name,
        accountIban: details.account.iban,
        accountBalance: balances.balances[0].balanceAmount.amount,
      })
    }

    res.json({
      success: true,
      data: accounts,
    })
  }
)

app.get('/', verifyUser, async (req: ServerRequest, res: ServerResponse) => {
  const data = await getLinkedAccounts({ userId: res.locals.userId })

  const accounts = []

  for (const account of data) {
    const { data: balances } = await getNordigenAccountBalances({ accountId: account.account_id })

    accounts.push({
      id: account.id,
      requisitionId: account.requisition_id,
      accountId: account.account_id,
      accountBalance: balances.balances[0].balanceAmount.amount,
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
})

app.post('/connect', verifyUser, linkAccount, async (req: ServerRequest<ConnectLinkedAccount>, res: ServerResponse) => {
  validationResult(req).throw()

  const { requisitionId, accountId } = req.body

  const { data: accountDetails } = await getNordigenAccountDetails({ accountId })
  const { data: accountMeta } = await getNordigenAccountMeta({ accountId })
  const { data: bankInfo } = await getNordigenInstitution({ institutionId: accountMeta.institution_id })

  await db(
    `INSERT INTO
      accounts(user_id, requisition_id, account_id, account_name, account_iban, bank_name, bank_logo)
      VALUES($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      res.locals.userId,
      requisitionId,
      accountId,
      accountDetails.account.name,
      accountDetails.account.iban,
      bankInfo.name,
      bankInfo.logo,
    ]
  )

  res.json({
    success: true,
  })
})

app.get(
  '/transactions/:accountId',
  verifyUser,
  getAccountTransactions,
  async (
    req: ServerRequest<object, LinkedAccountTransactionParams, LinkedAccountTransactionQuery>,
    res: ServerResponse
  ) => {
    validationResult(req).throw()

    const { accountId } = req.params
    const { search, category, from, to } = req.query

    const accounts = await getLinkedAccount({ userId: res.locals.userId, accountId })
    const account = accounts[0]

    if (!account) {
      throw new ServerError(403)
    }

    const { data: transactionsInfo } = await getNordigenAccountTransactions({
      accountId: account.account_id,
    })

    const { data: balances } = await getNordigenAccountBalances({ accountId: account.account_id })

    const transactions = transactionsInfo.transactions.booked
    let currentBalance = balances.balances[0].balanceAmount.amount

    // Map cumulative balance
    const nordigenCurrency = (value: string) => currency(value, { symbol: '', separator: '', decimal: '.' })

    let mappedTransactions = transactions.map((transaction, index) => {
      // Skip first transaction
      if (index !== 0) {
        const prevTransactionAmount = transactions[index - 1].transactionAmount.amount

        currentBalance = nordigenCurrency(currentBalance).subtract(prevTransactionAmount).format()
      }

      return {
        id: transaction.transactionId,
        weight: index,
        title: transaction.remittanceInformationUnstructuredArray[0],
        date: transaction.bookingDate,

        amount: nordigenCurrency(transaction.transactionAmount.amount).format({ decimal: ',', separator: '.' }),
        totalAmount: nordigenCurrency(currentBalance).format({ decimal: ',', separator: '.' }),
        totalAmountInt: nordigenCurrency(currentBalance).value,
      }
    })

    // Apply fuzzysort
    mappedTransactions = search
      ? fuzzysort.go(search, mappedTransactions, { key: 'title', threshold: -400 }).map((search) => search.obj)
      : mappedTransactions

    // Apply interval filtering
    mappedTransactions =
      from && to
        ? mappedTransactions.filter((transaction) => {
            const transactionDate = new Date(transaction.date)
            const fromDate = startOfDay(new Date(from))
            const endDate = endOfDay(new Date(to))

            return transactionDate >= fromDate && transactionDate <= endDate
          })
        : mappedTransactions

    // Apply categorization
    BayesClassifier.load('model.json', null, (err, classifier) => {
      const categorizedTransactions = []

      for (const transaction of mappedTransactions) {
        const classifiedCategory = classifier.getClassifications(transaction.title)[0].label

        if (!category || category === classifiedCategory) {
          categorizedTransactions.push({
            ...transaction,
            category: classifiedCategory,
          })
        }
      }

      res.json({
        success: true,
        data: categorizedTransactions.sort((prev, next) => prev.weight - next.weight),
      })
    })
  }
)

export default app
