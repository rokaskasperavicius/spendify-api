import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { NextFunction, Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import { StatusCodes } from 'http-status-codes'
import { setupServer } from 'msw/node'

import { COOKIE_SECRET, NODE_ENV } from '@/global/constants'
import { ERROR_CODES, ServerError } from '@/global/types'

import apiRoutes from '@/layers/api'

import { handlers } from '@/mocks/handlers'

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  let status = StatusCodes.INTERNAL_SERVER_ERROR
  let code: ERROR_CODES = -1

  if (error instanceof ServerError) {
    status = error.status
    code = error.code || -1
  }

  console.error(error.message)

  res.status(status).json({
    success: false,
    code,
  })
})

// plan https://chatgpt.com/c/d8b8e14e-cb3a-4b1b-b812-f2bb79ac1077
// use crypto.randomUUID() to generate a random sessions
// randomBytes is deprecated in crypto !!!
// store the session in a cookie -> secure: true, httpOnly: true, sameSite: 'strict'
// store the session in a database
// create a middleware to check if the session is valid
// no jwt?
// no refresh token? Cookies will be valid for 1 hour

// figure prisma migration with local db
// figure prisma migration with heroku db

// add mailsend for verifying emails

app.listen(port, () => {
  console.log(`⚡️ [server]: Server is running at http://localhost:${port}`)
})
