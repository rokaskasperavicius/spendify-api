// Helpers
import { nordigenApi } from '@services/nordigenApi'

type NordigenRequisition = {
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

type Props = {
  requisitionId: string
}

export const getNordigenRequisitions = ({ requisitionId }: Props) =>
  nordigenApi.get<NordigenRequisition>(`/requisitions/${requisitionId}/`)
