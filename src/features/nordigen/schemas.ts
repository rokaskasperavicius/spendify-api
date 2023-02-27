import { body, param } from 'express-validator'

export const createNordigenRequisition = [body('institutionId').notEmpty(), body('redirect').notEmpty()]

export const getNordigenAccounts = [param('requisitionId').notEmpty()]

export const linkNordigenAccount = [body('requisitionId').notEmpty(), body('accountId').notEmpty()]

export const getNordigenAccountTransactions = [param('accountId').notEmpty()]
