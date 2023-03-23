export type CreateAccountRequisitionBody = {
  institutionId: string
  redirect: string
}

export type GetAvailableAccountsParams = {
  requisitionId: string
}

export type CreateAccountBody = {
  requisitionId: string
  accountId: string
}

export type GetAccountTransactionsParams = {
  accountId: string
}

export type GetAccountTransactionsQuery = {
  search?: string
  category?: 'Food & Groceries' | 'Utilities' | 'Transfers'
  from?: string
  to?: string
}
