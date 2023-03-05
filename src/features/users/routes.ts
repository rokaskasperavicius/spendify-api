import 'express-async-errors'

import { validationResult } from 'express-validator'

import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// Services
import { db } from '@services/db'

// Helpers
import { getUser } from '@features/users/utils/getUser'
import { getUserWithRefreshToken } from '@features/users/utils/getUserWithRefreshToken'

// Types
import { ServerError, ERROR_CODES, ServerRequest, ServerResponse } from '@types'
import { RegisterBody, LoginBody } from '@features/users/routes.types'

// Schemas
import { registerUser, loginUser } from '@features/users/schemas'

// Constants
import {
  JWT_ACCESS_SECRET_KEY,
  JWT_REFRESH_SECRET_KEY,
  JWT_ACCESS_EXPIRATION,
  JWT_REFRESH_EXPIRATION,
} from '@constants'

const app = express.Router()

app.post('/register', registerUser, async (req: ServerRequest<RegisterBody>, res: ServerResponse) => {
  validationResult(req).throw()

  const { firstName, lastName, email, password } = req.body

  const users = await getUser({ email })
  const user = users[0]

  if (user) {
    throw new ServerError(400, ERROR_CODES.INVALID_CREDENTIALS)
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await db('INSERT INTO users(first_name, last_name, email, password) VALUES($1, $2, $3, $4)', [
    firstName,
    lastName,
    email,
    hashedPassword,
  ])

  res.json({
    success: true,
  })
})

app.post('/login', loginUser, async (req: ServerRequest<LoginBody>, res: ServerResponse) => {
  validationResult(req).throw()

  const { email, password } = req.body

  const users = await getUser({ email })
  const user = users[0]

  if (!user) {
    throw new ServerError(400, ERROR_CODES.INVALID_CREDENTIALS)
  }

  const userPassword = user.password
  const userId = user.id
  const firstName = user.first_name
  const lastName = user.last_name

  const isPasswordOk = userPassword ? await bcrypt.compare(password, userPassword) : false

  if (!isPasswordOk) {
    throw new ServerError(400, ERROR_CODES.INVALID_CREDENTIALS)
  }

  const accessToken = jwt.sign({ id: userId }, JWT_ACCESS_SECRET_KEY, {
    expiresIn: JWT_ACCESS_EXPIRATION,
  })

  const refreshToken = jwt.sign({ id: userId }, JWT_REFRESH_SECRET_KEY, {
    expiresIn: JWT_REFRESH_EXPIRATION,
  })

  await db('UPDATE users SET access_token = $2, refresh_token = $3 WHERE id = $1', [userId, accessToken, refreshToken])

  res.json({
    success: true,
    data: {
      firstName,
      lastName,
      accessToken,
      refreshToken,
    },
  })
})

app.post('/refresh-token', async (req: ServerRequest, res: ServerResponse) => {
  const refreshToken = req.headers.authorization?.split(' ')[1]

  if (!refreshToken) {
    throw new ServerError(401)
  }

  const users = await getUserWithRefreshToken({ refreshToken })
  const user = users[0]

  if (!user) {
    throw new ServerError(401)
  }

  try {
    jwt.verify(refreshToken, JWT_REFRESH_SECRET_KEY)

    const accessToken = jwt.sign({ id: user.id }, JWT_ACCESS_SECRET_KEY, {
      expiresIn: JWT_ACCESS_EXPIRATION,
    })

    await db('UPDATE users SET access_token = $2 WHERE id = $1', [user.id, accessToken])

    res.json({
      success: true,
      data: {
        accessToken,
      },
    })
  } catch (err) {
    throw new ServerError(401)
  }
})

export default app
