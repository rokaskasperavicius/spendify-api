import { body, param } from 'express-validator'

export const validateCreateAccountRequisition = [
  body('institutionId').notEmpty(),
  body('redirect').notEmpty().isURL({ require_tld: false }),
]

export const validateGetAvailableAccounts = [param('requisitionId').notEmpty()]

export const validateLinkAccount = [body('requisitionId').notEmpty(), body('accountId').notEmpty()]

export const validateDeleteAccount = [body('accountId').notEmpty()]

export const validateGetAccountTransactions = [
  body('accountId').notEmpty(),
  body('search').optional(),
  body('category').optional().isIn(['Food & Groceries', 'Utilities', 'Transfers']),

  body('intervals').notEmpty(),
  body('intervals.*.id').isString(),
  body('intervals.*.from').isInt(),
  body('intervals.*.to').isInt(),
]

export const validateGetAccountTransactionsGrouped = [param('accountId').notEmpty()]
