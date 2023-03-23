import { body, param, query } from 'express-validator'

export const validateCreateAccountRequisition = [
  body('institutionId').notEmpty(),
  body('redirect').notEmpty().isURL({ require_tld: false }),
]

export const validateGetAvailableAccounts = [param('requisitionId').notEmpty()]

export const validateLinkAccount = [body('requisitionId').notEmpty(), body('accountId').notEmpty()]

export const validateGetAccountTransactions = [
  param('accountId').notEmpty(),
  query('search').optional(),
  query('category').optional().isIn(['Food & Groceries', 'Utilities', 'Transfers']),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
]
