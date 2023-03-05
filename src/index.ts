import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import 'dotenv/config'

// Features
import linkedAccountRouter from '@features/linkedAccount/routes'
import usersRouter from '@features/users/routes'

// Types
import { ERROR_CODES, ServerError } from '@types'

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

app.get('/', async (req, res) => {
  res.send('Spendify API')
})

app.use('/api/linked-account', linkedAccountRouter)
app.use('/api', usersRouter)

app.use(
  (
    error: Error,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
  ) => {
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
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
})
