import axios, { AxiosError } from 'axios'

// Helpers
import nordigenTokens from '@layers/nordigen/nordigen.tokens'

// Constants
import { NORDIGEN_BASE_URL, NORDIGEN_SECRET_ID, NORDIGEN_SECRET_KEY } from '@global/constants'

// Types
import { CreatedNordigenToken } from '@layers/nordigen/nordigen.types'

const nordigenApi = axios.create({
  baseURL: NORDIGEN_BASE_URL,
})

nordigenApi.interceptors.request.use(
  async (config) => {
    const accessToken = nordigenTokens.accessToken
    config.headers['Authorization'] = `Bearer ${accessToken}`

    return config
  },

  (error) => {
    return Promise.reject(error)
  }
)

nordigenApi.interceptors.response.use(
  (response) => {
    return response
  },

  async (error: AxiosError) => {
    const { response, config } = error
    if (!config) return null

    // 401 - Unauthorized
    if (response?.status === 401) {
      const body = {
        secret_id: NORDIGEN_SECRET_ID,
        secret_key: NORDIGEN_SECRET_KEY,
      }

      const { data } = await axios.post<CreatedNordigenToken>(`${NORDIGEN_BASE_URL}/token/new/`, body)

      nordigenTokens.setAccessToken(data.access)
      nordigenTokens.setRefreshToken(data.refresh)

      return nordigenApi(config)
    }

    return Promise.reject(error)
  }
)

export { nordigenApi }
