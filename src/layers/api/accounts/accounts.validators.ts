import { body, param, query } from 'express-validator'
import { z } from 'zod'

export const CreateAccountRequisitionSchema = z.object({
  institutionId: z.string(),
  redirect: z.string().url(),
  maxHistoricalDays: z.number(),
})

export const validateCreateAccountRequisition = [
  body('institutionId').notEmpty(),
  body('redirect').notEmpty().isURL({ require_tld: false }),
]

export const validateGetAvailableAccounts = [param('requisitionId').notEmpty()]

export const validateLinkAccount = [body('accountId').notEmpty()]

export const validateDeleteAccount = [body('accountId').notEmpty()]

export const validateGetAccountTransactions = [
  param('accountId').notEmpty(),

  query('search').optional(),
  query('category').optional().isIn(['Food & Groceries', 'Utilities', 'Transfers']),

  query('intervals').notEmpty(),
  query('intervals.*.id').isString(),
  query('intervals.*.from').isInt(),
  query('intervals.*.to').isInt(),
]

export const validateGetAccountTransactionsGrouped = [param('accountId').notEmpty()]
