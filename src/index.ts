import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { NextFunction, Request, Response } from 'express'
import 'express-async-errors'
import rateLimit from 'express-rate-limit'
import { StatusCodes } from 'http-status-codes'
import { setupServer } from 'msw/node'
import schedule from 'node-schedule'

import { COOKIE_SECRET, NODE_ENV } from '@/lib/constants'
import { ERROR_CODES, ServerError } from '@/lib/types'

import { handlers } from '@/mocks/handlers'

import apiRoutes from '@/routes'

import { syncTransactions } from './lib/utils/sync-transactions'

// Setup
const server = setupServer(...handlers)
const app = express()
app.use(express.json())
app.use(cookieParser(COOKIE_SECRET))

if (NODE_ENV === 'development') {
  server.listen({
    // This is going to perform unhandled requests
    // but print no warning whatsoever when they happen.
    onUnhandledRequest: 'bypass',
  })
}

const port = process.env.PORT || 8080

// Allowed urls for accessing our API
const corsOptions = {
  origin: [
    // For development
    'http://localhost:3000',

    // For production
    'https://spendify-client.vercel.app',
    'https://www.spendify.dk',
  ],
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
}

// Setup CORS
app.use(cors(corsOptions))

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 30, // Limit each IP to 30 requests per `window` (here, per 1 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

app.use(limiter)

app.get('/', async (req, res) => {
  res.send('Spendify API')
})

app.use('/v1', apiRoutes)

/**
 * Create a cron job to sync transactions every day at 3am and 15pm UTC
 *
 * You can check how the cron job parser works here:
 * https://crontab.guru/#0_3,15_*_*_*
 */
schedule.scheduleJob('0 3,15 * * *', async () => {
  try {
    console.info('[INFO] Running cron job to sync transactions')

    await syncTransactions()
  } catch (error) {
    console.error('Cron job failed to sync transactions with error:', error)
  }
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  let status = StatusCodes.INTERNAL_SERVER_ERROR
  let code: ERROR_CODES = -1

  if (error instanceof ServerError) {
    status = error.status
    code = error.code || -1
  }

  if (error.message) {
    console.error(error.message)
  }

  res.status(status).json({
    success: false,
    code,
  })
})

app.listen(port, () => {
  console.log(`⚡️ [SERVER]: Server is running at http://localhost:${port}`)
})
