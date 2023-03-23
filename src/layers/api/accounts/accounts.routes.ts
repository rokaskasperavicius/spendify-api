import 'express-async-errors'
import express from 'express'

// Handlers
import {
  createAccount,
  createAccountRequisition,
  getAccounts,
  getAccountInstitutions,
  getAccountTransactions,
  getAvailableAccounts,
} from '@layers/api/accounts/accounts.handlers'

// Helpers
import { verifyUser } from '@middlewares'

// Validators
import {
  validateCreateAccountRequisition,
  validateGetAvailableAccounts,
  validateLinkAccount,
  validateGetAccountTransactions,
} from '@layers/api/accounts/accounts.validators'

const app = express.Router()

app.get('/institutions', getAccountInstitutions)

app.post('/create-requisition', verifyUser, validateCreateAccountRequisition, createAccountRequisition)

app.get('/available-accounts/:requisitionId', verifyUser, validateGetAvailableAccounts, getAvailableAccounts)

app.get('/', verifyUser, getAccounts)

app.post('/', verifyUser, validateLinkAccount, createAccount)

app.get('/transactions/:accountId', verifyUser, validateGetAccountTransactions, getAccountTransactions)

export default app
