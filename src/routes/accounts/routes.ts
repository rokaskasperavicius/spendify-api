import express from 'express'

import { validateSchema, verifyUser } from '@/middlewares'

import { CreateAccountSchema, createAccount } from './handlers/create-account'
import { CreateAccountRequisitionSchema, createAccountRequisition } from './handlers/create-account-requisition'
import { DeleteAccountSchema, deleteAccount } from './handlers/delete-account'
import { GetAccountInstitutionsSchema, getAccountInstitutions } from './handlers/get-account-institutions'
import { GetAccountTransactionsSchema, getAccountTransactions } from './handlers/get-account-transactions'
import {
  GetAccountTransactionsMonthlyOverview,
  getAccountTransactionsMonthlyOverview,
} from './handlers/get-account-transactions-monhtly-overview'
import { getAccounts } from './handlers/get-accounts'
import { GetAvailableAccountsSchema, getAvailableAccounts } from './handlers/get-available-accounts'
import { SyncAccountTransactionsSchema, syncAccountTransactions } from './handlers/sync-account-transactions'

const app = express.Router()

app.get('/institutions', validateSchema(GetAccountInstitutionsSchema), getAccountInstitutions)
app.post('/create-requisition', verifyUser, validateSchema(CreateAccountRequisitionSchema), createAccountRequisition)
app.get('/available/:requisitionId', verifyUser, validateSchema(GetAvailableAccountsSchema), getAvailableAccounts)
app.get('/', verifyUser, getAccounts)
app.post('/', verifyUser, validateSchema(CreateAccountSchema), createAccount)
app.get('/:accountId/transactions', verifyUser, validateSchema(GetAccountTransactionsSchema), getAccountTransactions)
app.get(
  '/:accountId/transactions/monthly-overview',
  verifyUser,
  validateSchema(GetAccountTransactionsMonthlyOverview),
  getAccountTransactionsMonthlyOverview
)
app.delete('/', verifyUser, validateSchema(DeleteAccountSchema), deleteAccount)
app.get('/transactions/sync', validateSchema(SyncAccountTransactionsSchema), syncAccountTransactions)

export default app
