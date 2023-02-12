import express from 'express'

// Services
import { api } from '@services/axios'

const app = express.Router()

app.get('/institutions', async (req, res, next) => {
  try {
    const data = await api(
      `/institutions/?country=${process.env.NORDIGEN_COUNTRY}`
    )

    res.json({
      success: true,
      data: data.data,
    })
  } catch (err) {
    next(err)
  }
})

export default app
