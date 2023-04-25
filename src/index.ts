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
    '*',
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

    res.status(status).json({
      success: false,
      message: error.message,
      code,
    })
  }
)

app.listen(port, () => {
  console.log(`⚡️ [server]: Server is running at http://localhost:${port}`)
})
