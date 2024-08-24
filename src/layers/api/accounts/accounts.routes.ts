import express, { NextFunction } from 'express'
import 'express-async-errors'
import { StatusCodes } from 'http-status-codes'
import { ZodSchema, z } from 'zod'

import { ERROR_CODES, ServerError, ServerRequest, ServerResponse } from '@/global/types'

import {
  createAccount,
  createAccountRequisition,
  deleteAccountHandler,
  getAccountInstitutions,
  getAccountTransactions,
  getAccountTransactionsGroupedHandler,
  getAccounts,
  getAvailableAccounts,
} from '@/layers/api/accounts/accounts.handlers'
import {
  CreateAccountRequisitionSchema,
  validateCreateAccountRequisition,
  validateDeleteAccount,
  validateGetAccountTransactions,
  validateGetAccountTransactionsGrouped,
  validateGetAvailableAccounts,
  validateLinkAccount,
} from '@/layers/api/accounts/accounts.validators'

import { verifyUser } from '@/middlewares'

const app = express.Router()

export function validateSchema(schema: ZodSchema) {
  return (req: ServerRequest, res: ServerResponse, next: NextFunction) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error) {
      console.log(error)
      throw new ServerError(StatusCodes.BAD_REQUEST, ERROR_CODES.INVALID_SCHEMA)
    }
  }
}

app.get('/institutions', getAccountInstitutions)

app.post('/create-requisition', verifyUser, validateSchema(CreateAccountRequisitionSchema), createAccountRequisition)

app.get('/available-accounts/:requisitionId', verifyUser, validateGetAvailableAccounts, getAvailableAccounts)

app.get('/', verifyUser, getAccounts)

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
