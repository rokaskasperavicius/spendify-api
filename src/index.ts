import express, { Request, Response, ErrorRequestHandler, NextFunction } from 'express'
import cors from 'cors'
import 'dotenv/config'

import bodyParser from 'body-parser'

import { ServerError } from 'error'

// Features
import nordigenRouter from '@features/nordigen/routes'
import usersRouter from '@features/users/routes'

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
    'https://csproject-client.herokuapp.com',
    'http://csproject-client.herokuapp.com',
  ],
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
}

// Setup CORS
app.use(cors(corsOptions))

app.get('/', async (req, res) => {
  res.send('Express + TypeScript Server')
})

app.use('/api/nordigen', nordigenRouter)
app.use('/api/users', usersRouter)

app.use(
  (
    error: Error,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
  ) => {
    let status = 400

    if (error instanceof ServerError) {
      status = error.status
    }

    console.log(error)
    res.status(status).json({
      success: false,
      message: error.message,
    })
  }
)

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
})
