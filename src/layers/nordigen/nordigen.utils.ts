import { AxiosResponse } from 'axios'

import { NORDIGEN_ACCESS_SCOPE, NORDIGEN_ACCESS_VALID_FOR_DAYS, NORDIGEN_COUNTRY } from '@/global/constants'

import { nordigenApi } from '@/layers/nordigen/nordigen.api'
import {
  CreateNordigenAgreementBody,
  CreateNordigenAgreementResponse,
  CreateNordigenRequisitionBody,
  CreateNordigenRequisitionResponse,
  GetNordigenAccountBalancesBody,
  GetNordigenAccountBalancesResponse,
  GetNordigenAccountDetailsBody,
  GetNordigenAccountDetailsResponse,
  GetNordigenAccountMetaBody,
  GetNordigenAccountMetaResponse,
  GetNordigenAccountTransactionsBody,
  GetNordigenAccountTransactionsResponse,
  GetNordigenInstitutionBody,
  GetNordigenInstitutionResponse,
  GetNordigenRequisitionBody,
  GetNordigenRequisitionResponse,
} from '@/layers/nordigen/nordigen.types'

import {
  AccountBalance,
  AccountDetails,
  AccountMetadata,
  EndUserAgreement,
  EndUserAgreementBody,
  Institution,
  Institutions,
  Requisition,
  RequisitionBody,
  RequisitionInfo,
} from '../test'

export const createNordigenAgreement = (body: EndUserAgreementBody) =>
  nordigenApi.post<EndUserAgreement, AxiosResponse<EndUserAgreement>, EndUserAgreementBody>(
    '/agreements/enduser/',
    body
  )

export const createNordigenRequisition = (body: RequisitionBody) =>
  nordigenApi.post<Requisition, AxiosResponse<Requisition>, RequisitionBody>('/requisitions/', body)

export const getAccountBalanceById = (accountId: string) =>
  nordigenApi.get<AccountBalance>(`/accounts/${accountId}/balances/`)

export const getAccountDetailsById = (accountId: string) =>
  nordigenApi.get<AccountDetails>(`/accounts/${accountId}/details/`)

export const getAccountMetadata = (accountId: string) => nordigenApi.get<AccountMetadata>(`/accounts/${accountId}/`)

export const getNordigenAccountTransactions = ({ accountId }: GetNordigenAccountTransactionsBody) =>
  nordigenApi.get<GetNordigenAccountTransactionsResponse>(`/accounts/${accountId}/transactions/`)

export const getInstitutionById = (institutionId: string) =>
  nordigenApi.get<Institution>(`/institutions/${institutionId}`)

export const getNordigenInstitutions = () => nordigenApi.get<Institutions>(`/institutions/?country=${NORDIGEN_COUNTRY}`)

export const getRequisitionById = (requisitionId: string) =>
  nordigenApi.get<RequisitionInfo>(`/requisitions/${requisitionId}/`)
