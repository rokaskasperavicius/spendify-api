import { ServerRequest } from '@global/types'

export type CreateAccountRequisitionBody = {
  institutionId: string
  redirect: string
}

export type GetAccountInstitutionsReq = ServerRequest<object, object, { query: string }>

export type GetAvailableAccountsParams = {
  requisitionId: string
}

export type CreateAccountBody = {
  accountId: string
}

export type DeleteAccountBody = {
  accountId: string
}

export type GetAccountTransactionsParams = {
  accountId: string
}

export type GetAccountTransactionsQuery = {
  search?: string
  category?: 'Food & Groceries' | 'Utilities' | 'Transfers'
  from: string
  to: string
}

export type GetAccountTransactionsGroupedParams = {
  accountId: string
}

export type ReducedGroupedTransactions = {
  date: string
  expenses: string
  income: string
  expensesInt: number
  incomeInt: number
}
