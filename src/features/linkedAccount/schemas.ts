import { body, param, query } from 'express-validator'

export const createRequisition = [
  body('institutionId').notEmpty(),
  body('redirect').notEmpty().isURL({ require_tld: false }),
]

export const getAvailableAccounts = [param('requisitionId').notEmpty()]

export const linkAccount = [body('requisitionId').notEmpty(), body('accountId').notEmpty()]

export const getAccountTransactions = [
  param('accountId').notEmpty(),
  query('search').optional(),
  query('category').optional().isIn(['Food & Groceries', 'Utilities', 'Transfers']),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
]
