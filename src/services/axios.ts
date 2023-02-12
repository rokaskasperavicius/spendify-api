import axios from 'axios'

// Services
import { db } from 'services/db'

const api = axios.create({
  baseURL: process.env.NORDIGEN_BASE_URL,
})

api.interceptors.request.use(
  async (config) => {
    const results = await db('SELECT access_token AS access FROM nordigen')
    const accessToken = results[0].access
    console.log(accessToken)
    if (!accessToken) {
      const data = await axios.post(
        `${process.env.NORDIGEN_BASE_URL}/token/new/`,
        {
          secret_id: process.env.NORDIGEN_SECRET_ID,
          secret_key: process.env.NORDIGEN_SECRET_KEY,
        },
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      )

      await db(`UPDATE nordigen SET access_token = $1, refresh_token = $2;`, [
        data.data.access,
        data.data.refresh,
      ])
    }

    if (config && config.headers) {
      config.headers['Authorization'] = `Bearer ${accessToken}`
      config.headers['Content-Type'] = 'application/json'
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
  async (error) => {
    const { response } = error
    // console.log(response)

    // 401 - unauthorized
    if (response.status === 401) {
      // await refreshAccessToken()
      // return api(error.config)
    }

    return Promise.reject(error)
  }
)

export { api }
