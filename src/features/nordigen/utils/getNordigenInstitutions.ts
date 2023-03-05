// Helpers
import { nordigenApi } from '@services/nordigenApi'

// Constants
import { NORDIGEN_COUNTRY } from '@constants'

type NordigenInstitution = {
  id: string
  name: number
  bic?: string
  transaction_total_days?: string
  countries: string[]
  logo: string
}

export const getNordigenInstitutions = () =>
  nordigenApi.get<NordigenInstitution[]>(`/institutions/?country=${NORDIGEN_COUNTRY}`)
