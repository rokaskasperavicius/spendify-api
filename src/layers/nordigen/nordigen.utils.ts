// Helpers
import { nordigenApi } from '@layers/nordigen/nordigen.api'

// Constants
import {
  NORDIGEN_MAX_HISTORICAL_DAYS,
  NORDIGEN_ACCESS_VALID_FOR_DAYS,
  NORDIGEN_ACCESS_SCOPE,
  NORDIGEN_COUNTRY,
} from '@global/constants'

// Types
import {
  CreateNordigenAgreementResponse,
  CreateNordigenAgreementBody,
  CreateNordigenRequisitionResponse,
  CreateNordigenRequisitionBody,
  GetNordigenAccountBalancesResponse,
  GetNordigenAccountBalancesBody,
  GetNordigenAccountDetailsResponse,
  GetNordigenAccountDetailsBody,
  GetNordigenAccountMetaResponse,
  GetNordigenAccountMetaBody,
  GetNordigenAccountTransactionsResponse,
  GetNordigenAccountTransactionsBody,
  GetNordigenInstitutionResponse,
  GetNordigenInstitutionBody,
  GetNordigenRequisitionResponse,
  GetNordigenRequisitionBody,
} from '@layers/nordigen/nordigen.types'

export const createNordigenAgreement = ({ institutionId }: CreateNordigenAgreementBody) =>
  nordigenApi.post<CreateNordigenAgreementResponse>('/agreements/enduser/', {
    institution_id: institutionId,
    max_historical_days: NORDIGEN_MAX_HISTORICAL_DAYS,
    access_valid_for_days: NORDIGEN_ACCESS_VALID_FOR_DAYS,
    access_scope: NORDIGEN_ACCESS_SCOPE,
  })

export const createNordigenRequisition = ({ institutionId, redirect, agreementId }: CreateNordigenRequisitionBody) =>
  nordigenApi.post<CreateNordigenRequisitionResponse>('/requisitions/', {
    institution_id: institutionId,
    redirect: redirect,
    agreement: agreementId,
  })

export const getNordigenAccountBalances = ({ accountId }: GetNordigenAccountBalancesBody) =>
  nordigenApi.get<GetNordigenAccountBalancesResponse>(`/accounts/${accountId}/balances/`)

export const getNordigenAccountDetails = ({ accountId }: GetNordigenAccountDetailsBody) =>
  nordigenApi.get<GetNordigenAccountDetailsResponse>(`/accounts/${accountId}/details/`)

export const getNordigenAccountMeta = ({ accountId }: GetNordigenAccountMetaBody) =>
  nordigenApi.get<GetNordigenAccountMetaResponse>(`/accounts/${accountId}/`)

export const getNordigenAccountTransactions = ({ accountId }: GetNordigenAccountTransactionsBody) =>
  nordigenApi.get<GetNordigenAccountTransactionsResponse>(`/accounts/${accountId}/transactions/`)

export const getNordigenInstitution = ({ institutionId }: GetNordigenInstitutionBody) =>
  nordigenApi.get<GetNordigenInstitutionResponse>(`/institutions/${institutionId}`)

export const getNordigenInstitutions = () =>
  nordigenApi.get<GetNordigenInstitutionResponse[]>(`/institutions/?country=${NORDIGEN_COUNTRY}`)

export const getNordigenRequisitions = ({ requisitionId }: GetNordigenRequisitionBody) =>
  nordigenApi.get<GetNordigenRequisitionResponse>(`/requisitions/${requisitionId}/`)
