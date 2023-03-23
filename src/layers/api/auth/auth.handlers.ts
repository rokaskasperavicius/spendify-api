/*
|--------------------------------------------------------------------------
| Auth Handlers
|--------------------------------------------------------------------------
|
| Here you define all of the handlers for the auth routes
|
*/

import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid'
import { validationResult } from 'express-validator'

// Helpers
import { getUserWithEmail, getUserWithRefreshToken, createUser, updateUserRefreshToken } from '@layers/database'
import { createAccessToken } from '@layers/api/auth/auth.utils'

// Types
import { ServerError, ERROR_CODES, ServerRequest, ServerResponse } from '@global/types'
import { RegisterUserBody, LoginUserBody } from '@layers/api/auth/auth.types'

export const registerUser = async (req: ServerRequest<RegisterUserBody>, res: ServerResponse) => {
  validationResult(req).throw()

  const { firstName, lastName, email, password } = req.body

  const users = await getUserWithEmail({ email })
  const user = users[0]

  if (user) {
    throw new ServerError(400, ERROR_CODES.INVALID_CREDENTIALS)
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await createUser({ firstName, lastName, email, password: hashedPassword })

  res.json({
    success: true,
  })
}

export const loginUser = async (req: ServerRequest<LoginUserBody>, res: ServerResponse) => {
  validationResult(req).throw()

  const { email, password } = req.body

  const users = await getUserWithEmail({ email })
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

  const accessToken = createAccessToken({ userId })

  const refreshToken = uuid()

  await updateUserRefreshToken({ userId, refreshToken })

  res.json({
    success: true,
    data: {
      user: {
        firstName,
        lastName,
      },

      auth: {
        accessToken,
        refreshToken,
      },
    },
  })
}

export const refreshUserToken = async (req: ServerRequest, res: ServerResponse) => {
  const refreshToken = req.headers.authorization?.split(' ')[1]

  if (!refreshToken) {
    throw new ServerError(401)
  }

  const users = await getUserWithRefreshToken({ refreshToken })
  const user = users[0]

  if (!user) {
    throw new ServerError(401)
  }

  const userId = user.id

  const accessToken = createAccessToken({ userId })
  const newRefreshToken = uuid()

  await updateUserRefreshToken({ userId, refreshToken: newRefreshToken })

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken: newRefreshToken,
    },
  })
}
