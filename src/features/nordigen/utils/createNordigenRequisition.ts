// Helpers
import { nordigenApi } from '@services/nordigenApi'

type NordigenRequisition = {
  id: string
  link: string
  status: string
}

type Props = {
  institutionId: string
  redirect: string
  agreementId: string
}

export const createNordigenRequisition = ({ institutionId, redirect, agreementId }: Props) =>
  nordigenApi.post<NordigenRequisition>('/requisitions/', {
    institution_id: institutionId,
    redirect: redirect,
    agreement: agreementId,
  })
