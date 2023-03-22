import axios, { AxiosError } from 'axios'

// Helpers
import { db } from '@services/db'

import { createNordigenToken } from '@features/nordigen/utils/createNordigenToken'
import { getNordigenToken } from '@features/nordigen/utils/getNordigenToken'

// Constants
import { NORDIGEN_BASE_URL } from '@constants'
import nordigenAccess from '@config/nordigenAccess'

const nordigenApi = axios.create({
  baseURL: NORDIGEN_BASE_URL,
})

nordigenApi.interceptors.request.use(
  async (config) => {
    const controller = new AbortController()
    config.signal = controller.signal

    try {
      const results = await getNordigenToken()

      const accessToken = results[0]?.access_token

      config.headers['Authorization'] = `Bearer ${accessToken}`
    } catch (err) {
      controller.abort(err)
    }

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

    // 401 - unauthorized
    // TO DO: fix possible loop
    if (response?.status === 401) {
      const { data } = await createNordigenToken()

      console.log('NORDIGEN: ', data)

      nordigenAccess.setAccessToken(data.access)
      nordigenAccess.setRefreshToken(data.refresh)

      // await db(`UPDATE nordigen SET access_token = $1`, [data.access])

      return nordigenApi(config)
    }

    return Promise.reject(error)
  }
)

export { nordigenApi }
