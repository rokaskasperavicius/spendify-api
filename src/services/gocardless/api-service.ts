import axios, { AxiosError } from 'axios'

import { GOCARDLESS_BASE_URL, GOCARDLESS_SECRET_ID, GOCARDLESS_SECRET_KEY } from '@/lib/constants'

import { NewToken } from './types'
import gocardlessTokens from './utils/tokens'

const gocardlessApi = axios.create({
  baseURL: GOCARDLESS_BASE_URL,
})

gocardlessApi.interceptors.request.use(
  async (config) => {
    const accessToken = gocardlessTokens.accessToken
    config.headers['Authorization'] = `Bearer ${accessToken}`

    return config
  },

  (error) => {
    return Promise.reject(error)
  }
)

gocardlessApi.interceptors.response.use(
  (response) => {
    return response
  },

  async (error: AxiosError) => {
    const { response, config } = error
    if (!config) return null

    // 401 - Unauthorized
    if (response?.status === 401) {
      const { data } = await axios.post<NewToken>(`${GOCARDLESS_BASE_URL}/token/new/`, {
        secret_id: GOCARDLESS_SECRET_ID,
        secret_key: GOCARDLESS_SECRET_KEY,
      })

      gocardlessTokens.setAccessToken(data.access)
      gocardlessTokens.setRefreshToken(data.refresh)

      return gocardlessApi(config)
    }

    return Promise.reject(error)
  }
)

export { gocardlessApi }
