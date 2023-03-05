// Helpers
import { nordigenApi } from '@services/nordigenApi'

type NordigenAgreement = {
  id: string
  institution_id: string
  accepted?: string
  created?: string
}

type Props = {
  institutionId: string
}

export const createNordigenAgreement = ({ institutionId }: Props) =>
  nordigenApi.post<NordigenAgreement>('/agreements/enduser/', {
    institution_id: institutionId,
    max_historical_days: 720,
    access_valid_for_days: 30,
    access_scope: ['balances', 'details', 'transactions'],
  })
