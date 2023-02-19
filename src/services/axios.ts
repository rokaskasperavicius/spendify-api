import axios, { AxiosError } from 'axios'

// Helpers
import { db } from '@services/db'
import { getNordigenToken } from '@features/nordigen/tokens'

const api = axios.create({
  baseURL: process.env.NORDIGEN_BASE_URL,
})

api.interceptors.request.use(
  async (config) => {
    const controller = new AbortController()
    config.signal = controller.signal

    try {
      const results = await db('SELECT access_token AS access FROM nordigen')

      const accessToken = results[0].access

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

api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    console.log(error)
    const { response, config } = error
    if (!config) return null

    // 401 - unauthorized
    // TO DO: fix possible loop
    if (response?.status === 401) {
      const data = await getNordigenToken()

      await db(`UPDATE nordigen SET access_token = $1`, [data.data.access])

      return api(config)
    }

    return Promise.reject(error)
  }
)

export { api }
