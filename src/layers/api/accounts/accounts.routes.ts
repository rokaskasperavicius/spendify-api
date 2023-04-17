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
  deleteAccountHandler,
  getAccountTransactionsGroupedHandler,
} from '@layers/api/accounts/accounts.handlers'

// Helpers
import { verifyUser } from '@middlewares'

// Validators
import {
  validateCreateAccountRequisition,
  validateGetAvailableAccounts,
  validateLinkAccount,
  validateGetAccountTransactions,
  validateDeleteAccount,
  validateGetAccountTransactionsGrouped,
} from '@layers/api/accounts/accounts.validators'

const app = express.Router()

app.get('/institutions', getAccountInstitutions)

app.post('/create-requisition', verifyUser, validateCreateAccountRequisition, createAccountRequisition)

app.get('/available-accounts/:requisitionId', verifyUser, validateGetAvailableAccounts, getAvailableAccounts)

app.get('/', verifyUser, getAccounts)

// app.get('/test', validateTest, (req: any, res: any) => {
//   validationResult(req).throw()
//   console.log(req.query.intervals)

//   res.json({ success: true })
// })

app.post('/', verifyUser, validateLinkAccount, createAccount)

app.delete('/', verifyUser, validateDeleteAccount, deleteAccountHandler)

app.get('/:accountId/transactions', verifyUser, validateGetAccountTransactions, getAccountTransactions)

app.get(
  '/:accountId/transactions/grouped',
  verifyUser,
  validateGetAccountTransactionsGrouped,
  getAccountTransactionsGroupedHandler
)

export default app
