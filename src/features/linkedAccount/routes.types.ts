export type CreateRequisition = {
  institutionId: string
  redirect: string
}

export type GetAvailableAccounts = {
  requisitionId: string
}

export type ConnectLinkedAccount = {
  requisitionId: string
  accountId: string
}

export type LinkedAccountTransactionParams = {
  accountId: string
}

export type LinkedAccountTransactionQuery = {
  search?: string
  category?: 'Food & Groceries' | 'Utilities' | 'Transfers'
  from?: string
  to?: string
}
