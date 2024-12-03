import type { paths } from './generated'

export type NewToken = paths['/api/v2/token/new/']['post']['responses'][200]['content']['application/json']

export type Institutions = paths['/api/v2/institutions/']['get']['responses'][200]['content']['application/json']

export type EndUserAgreement =
  paths['/api/v2/agreements/enduser/']['post']['responses'][201]['content']['application/json']
export type EndUserAgreementBody =
  paths['/api/v2/agreements/enduser/']['post']['requestBody']['content']['application/json']

export type Requisition = paths['/api/v2/requisitions/']['post']['responses'][201]['content']['application/json']
export type RequisitionBody = paths['/api/v2/requisitions/']['post']['requestBody']['content']['application/json']

export type RequisitionInfo =
  paths['/api/v2/requisitions/{id}/']['get']['responses'][200]['content']['application/json']

export type AccountMetadata = paths['/api/v2/accounts/{id}/']['get']['responses'][200]['content']['application/json']

export type AccountDetails =
  paths['/api/v2/accounts/{id}/details/']['get']['responses'][200]['content']['application/json']

export type AccountBalance =
  paths['/api/v2/accounts/{id}/balances/']['get']['responses'][200]['content']['application/json']

export type AccountTransactions =
  paths['/api/v2/accounts/{id}/transactions/']['get']['responses'][200]['content']['application/json']

export type BookedTransaction = AccountTransactions['transactions']['booked'][0]
export type FormattedTransaction = Omit<BookedTransaction, 'valueDate' | 'transactionId'> & {
  title: string
  category: string
  transactionId: string
  amount: number
  totalAmount: number
  valueDate: string
}

export type Institution = paths['/api/v2/institutions/{id}/']['get']['responses'][200]['content']['application/json']
