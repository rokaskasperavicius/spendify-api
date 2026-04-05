import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

import { GOCARDLESS_BASE_URL, GOCARDLESS_SECRET_ID, GOCARDLESS_SECRET_KEY } from '@/lib/constants'

import { NewToken } from './types'

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean
}
let accessToken: string | undefined = undefined

const gocardlessApi = axios.create({
  baseURL: GOCARDLESS_BASE_URL,
})

gocardlessApi.interceptors.request.use(
  async (config) => {
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`
    }

    return config
  },

  (error) => {
    return Promise.reject(error)
  },
)

gocardlessApi.interceptors.response.use(
  (response) => {
    return response
  },

  async (error: AxiosError) => {
    const { response, config } = error
    const originalRequest = config as RetryableRequest

    if (!config || originalRequest._retry) {
      return Promise.reject(error)
    }

    // 401 - Unauthorized
    if (response?.status === 401) {
      originalRequest._retry = true

      try {
        const { data } = await axios.post<NewToken>(`${GOCARDLESS_BASE_URL}/token/new/`, {
          secret_id: GOCARDLESS_SECRET_ID,
          secret_key: GOCARDLESS_SECRET_KEY,
        })

        accessToken = data.access

        return gocardlessApi(config)
      } catch (tokenRefreshError) {
        accessToken = undefined
        return Promise.reject(tokenRefreshError)
      }
    }

    return Promise.reject(error)
  },
)

export { gocardlessApi }
