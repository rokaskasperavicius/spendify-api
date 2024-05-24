import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import 'dotenv/config'

// Routes
import apiRoutes from '@layers/api'

// Types
import { ERROR_CODES, ServerError } from '@global/types'

// Setup
const app = express()
app.use(express.json())

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

app.use('/api', apiRoutes)

app.use(
  (
    error: Error,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
  ) => {
    console.log(error)
    let status = 500
    let code: ERROR_CODES = -1

    if (error instanceof ServerError) {
      status = error.status
      code = error.code || -1
    }

    let message = error.message

    if (process.env.NODE_ENV === 'production') {
      message = 'Something went wrong'
    }

    res.status(status).json({
      success: false,
      message,
      code,
    })
  }
)

import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'

const mailerSend = new MailerSend({
  apiKey: process.env.MAILER_API as string,
})

const sentFrom = new Sender('no-reply@spendify.dk', 'Spendify')

const recipients = [new Recipient('goodname258@gmail.com', 'Rokas Kasperavicius')]

const emailParams = new EmailParams()
  .setFrom(sentFrom)
  .setTo(recipients)
  .setReplyTo(sentFrom)
  .setSubject('[no-reply] Verify your Spendify account')
  .setHtml('<a href="https://spendify.dk" target="_blank">https://spendify.dk</a>')
// .setText('This is the text content')

app.listen(port, async () => {
  console.log(`⚡️ [server]: Server is running at http://localhost:${port}`)

  try {
    await mailerSend.email.send(emailParams)
  } catch (error) {
    console.log(error)
  }
})
