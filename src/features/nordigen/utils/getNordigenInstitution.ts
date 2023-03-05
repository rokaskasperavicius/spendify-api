// Helpers
import { nordigenApi } from '@services/nordigenApi'

type NordigenInstitution = {
  id: string
  name: number
  bic?: string
  transaction_total_days?: string
  countries: string[]
  logo: string
}

type Props = {
  institutionId: string
}

export const getNordigenInstitution = ({ institutionId }: Props) =>
  nordigenApi.get<NordigenInstitution>(`/institutions/${institutionId}`)
