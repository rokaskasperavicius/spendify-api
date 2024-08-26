import { AxiosResponse } from 'axios'

import { NORDIGEN_COUNTRY } from '@/lib/constants'

import { gocardlessApi } from './api-service'
import {
  AccountBalance,
  AccountDetails,
  AccountMetadata,
  AccountTransactions,
  EndUserAgreement,
  EndUserAgreementBody,
  Institution,
  Institutions,
  Requisition,
  RequisitionBody,
  RequisitionInfo,
} from './types'

export const createNordigenAgreement = (body: EndUserAgreementBody) =>
  gocardlessApi.post<EndUserAgreement, AxiosResponse<EndUserAgreement>, EndUserAgreementBody>(
    '/agreements/enduser/',
    body
  )

export const createNordigenRequisition = (body: RequisitionBody) =>
  gocardlessApi.post<Requisition, AxiosResponse<Requisition>, RequisitionBody>('/requisitions/', body)

export const getAccountBalanceById = (accountId: string) =>
  gocardlessApi.get<AccountBalance>(`/accounts/${accountId}/balances/`)

export const getAccountDetailsById = (accountId: string) =>
  gocardlessApi.get<AccountDetails>(`/accounts/${accountId}/details/`)

export const getAccountMetadata = (accountId: string) => gocardlessApi.get<AccountMetadata>(`/accounts/${accountId}/`)

export const getAccountTransactionsById = (accountId: string) =>
  gocardlessApi.get<AccountTransactions>(`/accounts/${accountId}/transactions/`)

export const getInstitutionById = (institutionId: string) =>
  gocardlessApi.get<Institution>(`/institutions/${institutionId}`)

export const getNordigenInstitutions = () =>
  gocardlessApi.get<Institutions>(`/institutions/?country=${NORDIGEN_COUNTRY}`)

export const getRequisitionById = (requisitionId: string) =>
  gocardlessApi.get<RequisitionInfo>(`/requisitions/${requisitionId}/`)
