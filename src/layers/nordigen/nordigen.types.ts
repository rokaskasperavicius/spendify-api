export type CreatedNordigenToken = {
  access: string
  access_expires: number
  refresh: string
  refresh_expires: string
}

export type CreateNordigenAgreementResponse = {
  id: string
  institution_id: string
  accepted?: string
  created?: string
}

export type CreateNordigenAgreementBody = {
  institutionId: string
}

export type CreateNordigenRequisitionResponse = {
  id: string
  link: string
  status: string
}

export type CreateNordigenRequisitionBody = {
  institutionId: string
  redirect: string
  agreementId: string
}

export type GetNordigenAccountBalancesResponse = {
  balances: {
    balanceAmount: {
      amount: string
      currency: string
    }

    balanceType: string
    creditLimitIncluded: boolean
    referenceDate: string
  }[]
}

export type GetNordigenAccountBalancesBody = {
  accountId: string
}

export type GetNordigenAccountDetailsResponse = {
  account: {
    resourceId: string
    iban: string
    bban: string
    currency: string
    ownerName: string
    name: string
    cashAccountType: string
    bic: string
    usage: string
  }
}

export type GetNordigenAccountDetailsBody = {
  accountId: string
}

export type GetNordigenAccountMetaResponse = {
  id: string
  created: string
  last_accessed: string
  iban: string
  institution_id: string
  status: string
  owner_name: string
}

export type GetNordigenAccountMetaBody = {
  accountId: string
}

export type GetNordigenAccountTransactionsResponse = {
  transactions: {
    booked: NordigenBookedTransactions[]
  }
}

type NordigenBookedTransactions = {
  transactionId: string
  valueDate: string
  transactionAmount: {
    amount: string
  }
  remittanceInformationUnstructuredArray?: string[]
  remittanceInformationUnstructured?: string
}

export type GetNordigenAccountTransactionsBody = {
  accountId: string
}

export type GetNordigenInstitutionResponse = {
  id: string
  name: string
  bic?: string
  transaction_total_days?: string
  countries: string[]
  logo: string
}

export type GetNordigenInstitutionBody = {
  institutionId: string
}

export type GetNordigenRequisitionResponse = {
  id: number
  created: string
  redirect: string
  status: string
  institution_id: string
  agreement: string
  reference: string
  accounts: string[]
  user_language: string
  link: string
  ssn: string
  account_selection: boolean
  redirect_immediate: boolean
}

export type GetNordigenRequisitionBody = {
  requisitionId: string
}
