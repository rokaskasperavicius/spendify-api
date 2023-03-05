// Helpers
import { nordigenApi } from '@services/nordigenApi'

// Constants
import { NORDIGEN_BASE_URL, NORDIGEN_SECRET_ID, NORDIGEN_SECRET_KEY } from '@constants'

type CreatedNordigenToken = {
  access: string
  access_expires: number
  refresh: string
  refresh_expires: string
}

const body = {
  secret_id: NORDIGEN_SECRET_ID,
  secret_key: NORDIGEN_SECRET_KEY,
}

export const createNordigenToken = () => {
  return nordigenApi.post<CreatedNordigenToken>(`${NORDIGEN_BASE_URL}/token/new/`, body)
}
