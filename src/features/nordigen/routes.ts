import 'express-async-errors'

import levenshtein from 'fast-levenshtein'
import fuzzysort from 'fuzzysort'
import Fuse from 'fuse.js'
import express, { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { validationResult } from 'express-validator'

import { BayesClassifier } from 'natural'

import { ServerError } from 'error'

// Services
import { api } from '@services/axios'
import { db } from '@services/db'

import {
  createNordigenRequisition,
  getNordigenAccounts,
  linkNordigenAccount,
  getNordigenAccountTransactions,
} from '@features/nordigen/schemas'

import { categorized } from 'features/nordigen/config'

const app = express.Router()

app.get('/institutions', async (req, res) => {
  const { data } = await api.get(`/institutions/?country=${process.env.NORDIGEN_COUNTRY}`)

  res.json({
    success: true,
    data,
  })
})

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]

  const user = await db('SELECT id FROM users where access_token = $1', [token])

  if (user.length === 0 || !token) {
    throw new ServerError(401)
  }

  try {
    jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY as string)

    res.locals.user = user[0].id

    next()
  } catch (err) {
    throw new ServerError(401, 'Unauthorized')
  }
}

app.post('/requisition', verifyToken, createNordigenRequisition, async (req: Request, res: Response) => {
  validationResult(req).throw()

  const { institutionId } = req.body

  const { data: agreement } = await api.post('/agreements/enduser/', {
    institution_id: institutionId,
    max_historical_days: 720,
    access_valid_for_days: 30,
    access_scope: ['balances', 'details', 'transactions'],
  })

  const { data } = await api.post('/requisitions/', {
    institution_id: institutionId,
    redirect: process.env.NORDIGEN_REDIRECT,
    agreement: agreement.id,
  })

  res.json({
    success: true,
    data: {
      link: data.link,
    },
  })
})

app.get('/accounts/:requisitionId', verifyToken, getNordigenAccounts, async (req: Request, res: Response) => {
  validationResult(req).throw()

  const { requisitionId } = req.params

  const { data } = await api.get(`/requisitions/${requisitionId}/`)

  const accounts = []

  for (const account of data.accounts) {
    const { data: details } = await api.get(`/accounts/${account}/details/`)
    const { data: balances } = await api.get(`/accounts/${account}/balances/`)

    accounts.push({
      name: details.account.name,
      iban: details.account.iban,
      accountId: account,
      ammount: balances.balances[0].balanceAmount.amount,
    })
  }

  res.json({
    success: true,
    data: {
      requisitionId,
      accounts,
    },
  })
})

app.get('/accounts', verifyToken, async (req: Request, res: Response) => {
  validationResult(req).throw()

  const data = await db('SELECT id, account_id AS "accountId" FROM accounts WHERE user_id = $1', [res.locals.user])

  const accounts = []

  for (const account of data) {
    const { accountId } = account
    const { data: balances } = await api.get(`/accounts/${accountId}/balances/`)

    accounts.push({
      id: account.id,
      accountId,
      ammount: balances.balances[0].balanceAmount.amount,
    })
  }

  res.json({
    success: true,
    data: accounts,
  })
})

app.post('/link', verifyToken, linkNordigenAccount, async (req: Request, res: Response) => {
  validationResult(req).throw()

  const { requisitionId, accountId } = req.body

  const { data: accountDetails } = await api.get(`/accounts/${accountId}/details/`)
  const { data: accountMeta } = await api.get(`/accounts/${accountId}/`)
  const { data: bankInfo } = await api.get(`/institutions/${accountMeta.institution_id}`)

  await db(
    `INSERT INTO
      accounts(user_id, requisition_id, account_id, account_name, account_iban, bank_name, bank_logo)
      VALUES($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      res.locals.user,
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

// const fuse = new Fuse(FUZZY_SEARCH_CONFIG, {
//   keys: ['title'],
// })

app.get(
  '/transactions/:accountId',
  verifyToken,
  getNordigenAccountTransactions,
  async (req: Request, res: Response) => {
    validationResult(req).throw()

    const { accountId } = req.params

    const { data: transactions } = await api.get(`/accounts/${accountId}/transactions/`)

    // const results = fuzzysort.go(
    //   transactions.transactions.booked[0].remittanceInformationUnstructuredArray[0],
    //   FUZZY_SEARCH_CONFIG,
    //   { key: 'title' }
    // )

    // const mystuff = [{ file: 'Monitor.cpp' }, { file: 'MeshRenderer.cpp' }]
    // const results = fuzzysort.go('wolt copenhagen', FUZZY_SEARCH_CONFIG, {
    //   threshold: -Infinity, // Don't return matches worse than this (higher is faster)
    //   limit: Infinity, // Don't return more results than this (lower is faster)
    //   all: false, // If true, returns all results for an empty search
    //   key: 'title',
    // })

    // console.log('Wolt, Copenhagen'.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ''))
    // console.log(results)

    // const search = 'wolt copenhagen'

    // FUZZY_SEARCH_CONFIG.forEach((con) => {
    //   console.log(`${con.title}: ${levenshtein.get(search, con.title)}`)
    // })

    BayesClassifier.load('model.json', null, (err, classifier) => {
      classifier.getClassifications('Dankort-køb MobilePay Nota 989898743')[0].label

      const categorized = []

      for (const transaction of transactions.transactions.booked) {
        categorized.push({
          title: transaction.remittanceInformationUnstructuredArray[0],
          category: classifier.getClassifications(transaction.remittanceInformationUnstructuredArray[0])[0].label,
          amount: transaction.transactionAmount.amount,
          date: transaction.bookingDate,
        })
      }

      res.json({
        success: true,
        data: categorized,
      })
    })
  }
)

app.get('/natural', async (req, res) => {
  BayesClassifier.load('model.json', null, (err, classifier) => {
    // const dataCategorized: any = []
    // doubleNotCategorized.forEach((field) => {
    //   const category = classifier.classify(field.title)

    //   dataCategorized.push({
    //     title: field.title,
    //     category,
    //   })
    // })

    console.log(classifier.getClassifications('Dankort-køb MobilePay Nota 989898743'))

    res.json({
      success: true,
      // data: dataCategorized,
    })
  })
  // const classifier = new BayesClassifier()

  // categorized.forEach((category) => {
  //   classifier.addDocument(category.title, category.category)
  // })

  // classifier.train()

  // await classifier.save('classifier.json', () => {
  //   console.log('SAVED')

  //   res.json({
  //     success: true,
  //   })
  // })

  // console.log(classifier.classify('SU'))
})

export default app
