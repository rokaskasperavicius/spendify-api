import axios, { AxiosError } from 'axios'

import { GOCARDLESS_BASE_URL, GOCARDLESS_SECRET_ID, GOCARDLESS_SECRET_KEY } from '@/lib/constants'

import { NewToken } from './types'
import gocardlessTokens from './utils/tokens'

const gocardlessApi = axios.create({
  baseURL: GOCARDLESS_BASE_URL,
})

gocardlessApi.interceptors.request.use(
  async (config) => {
    let accessToken = gocardlessTokens.accessToken

    if (!accessToken) {
      const { data } = await axios.post<NewToken>(`${GOCARDLESS_BASE_URL}/token/new/`, {
        secret_id: GOCARDLESS_SECRET_ID,
        secret_key: GOCARDLESS_SECRET_KEY,
      })

      accessToken = data.access
      gocardlessTokens.setAccessToken(data.access)
    }

    config.headers['Authorization'] = `Bearer ${accessToken}`
    config.headers['Api-Retry-Count'] = 0

    return config
  },

  (error) => {
    return Promise.reject(error)
  },
)

let counter = 0

gocardlessApi.interceptors.response.use(
  (response) => {
    return response
  },

  async (error: AxiosError) => {
    const { response, config } = error
    if (!config) return null

    console.log(`[ERROR] GoCardless API error: ${JSON.stringify(response?.config)}`)
    console.log(`[ERROR] GoCardless API error2: ${JSON.stringify(response?.headers)}`)
    console.log(`[ERROR] GoCardless API error3: ${JSON.stringify(error.toJSON())}`)

    // 401 - Unauthorized
    if (response?.status === 401) {
      const retryCount = Number(config.headers['Api-Retry-Count'] || 0)

      if (retryCount > 0) {
        console.error('[ERROR] Detected 401 error after refreshing token, not retrying again.')
        return Promise.reject(error)
      }

      config.headers['Api-Retry-Count'] = 1

      if (counter >= 2) {
        console.error(`[ERROR] Failed to refresh GoCardless token after ${counter} attempts`)
        return Promise.reject(error)
      }

      counter++

      // const { data } = await axios.post<NewToken>(`${GOCARDLESS_BASE_URL}/token/new/`, {
      //   secret_id: GOCARDLESS_SECRET_ID,
      //   secret_key: GOCARDLESS_SECRET_KEY,
      // })

      gocardlessTokens.setAccessToken(undefined)

      return gocardlessApi(config)
    }

    return Promise.reject(error)
  },
)

export { gocardlessApi }
