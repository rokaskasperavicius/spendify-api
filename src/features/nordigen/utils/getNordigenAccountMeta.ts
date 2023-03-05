// Helpers
import { nordigenApi } from '@services/nordigenApi'

type NordigenAccountMeta = {
  id: string
  created: string
  last_accessed: string
  iban: string
  institution_id: string
  status: string
  owner_name: string
}

type Props = {
  accountId: string
}

export const getNordigenAccountMeta = ({ accountId }: Props) =>
  nordigenApi.get<NordigenAccountMeta>(`/accounts/${accountId}/`)
