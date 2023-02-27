import 'express-async-errors'

import { validationResult } from 'express-validator'

import express, { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// Services
import { db } from '@services/db'

import { ServerError } from 'error'

import { registerUser, loginUser } from '@features/users/schemas'

// Types
import { ERROR_CODES } from 'types'

const app = express.Router()

app.post('/register', registerUser, async (req: Request, res: Response) => {
  try {
    validationResult(req).throw()
  } catch (err) {
    throw new ServerError(400, ERROR_CODES.INVALID_EMAIL, err instanceof Error ? err.message : '')
  }

  const { firstName, lastName, email, password } = req.body

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

app.post('/login', loginUser, async (req: Request, res: Response) => {
  try {
    validationResult(req).throw()
  } catch (error) {
    throw new ServerError(400, ERROR_CODES.WRONG_PASSWORD)
  }

  const { email, password } = req.body

  const user = (await db('SELECT id, password, first_name, last_name FROM users WHERE email = $1', [email]))[0]

  const isPasswordOk = await bcrypt.compare(password, user.password)

  if (!isPasswordOk) {
    throw new ServerError(400, ERROR_CODES.WRONG_PASSWORD)
  }

  const accessToken = jwt.sign({ id: user.id }, process.env.JWT_ACCESS_SECRET_KEY as string, {
    expiresIn: '15m', // 15 minutes,
  })

  const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET_KEY as string, {
    expiresIn: '5d', // 5 days,
  })

  await db('UPDATE users SET access_token = $2, refresh_token = $3 WHERE id = $1', [user.id, accessToken, refreshToken])

  res.json({
    success: true,
    data: {
      firstName: user.first_name,
      lastName: user.last_name,
      accessToken,
      refreshToken,
    },
  })
})

app.post('/refresh-token', async (req: Request, res: Response) => {
  const refreshToken = req.headers.authorization?.split(' ')[1]

  const user = await db('SELECT id FROM users WHERE refresh_token = $1', [refreshToken])

  if (user.length === 0 || !refreshToken) {
    throw new ServerError(401)
  }

  try {
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET_KEY as string)

    const accessToken = jwt.sign({ id: user[0].id }, process.env.JWT_ACCESS_SECRET_KEY as string, {
      expiresIn: '15m', // 15 minutes,
    })

    await db('UPDATE users SET access_token = $2 WHERE id = $1', [user[0].id, accessToken])

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
