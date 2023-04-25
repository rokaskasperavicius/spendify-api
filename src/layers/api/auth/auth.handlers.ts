/*
|--------------------------------------------------------------------------
| Auth Handlers
|--------------------------------------------------------------------------
|
| Here you define all of the handlers for the auth routes
|
*/

import bcrypt from 'bcrypt'
import axios from 'axios'
import { v4 as uuid } from 'uuid'
import { validationResult } from 'express-validator'
import requestIp from 'request-ip'
import isIP from 'validator/lib/isIP'

// Helpers
import {
  getUserWithEmail,
  getUserWithRefreshToken,
  createUser,
  updateUserRefreshToken,
  getUserWithId,
  patchUserInfo,
  patchUserPassword,
  setUserRefreshToken,
  deleteUserRefreshToken,
  getAllUserTokens,
} from '@layers/database'
import { createAccessToken } from '@layers/api/auth/auth.utils'

// Types
import { ServerError, ERROR_CODES, ServerRequest, ServerResponse } from '@global/types'
import {
  RegisterUserBody,
  LoginUserBody,
  PatchUserInfoBody,
  PatchUserPasswordBody,
  SignOutUserBody,
  GetIPLocationSuccessResponse,
} from '@layers/api/auth/auth.types'

export const registerUser = async (req: ServerRequest<RegisterUserBody>, res: ServerResponse) => {
  validationResult(req).throw()

  const { name, email, password } = req.body

  const users = await getUserWithEmail({ email })
  const user = users[0]

  if (user) {
    throw new ServerError(400, ERROR_CODES.INVALID_CREDENTIALS)
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await createUser({ name, email, password: hashedPassword })

  res.json({
    success: true,
  })
}

export const loginUser = async (req: ServerRequest<LoginUserBody>, res: ServerResponse) => {
  validationResult(req).throw()

  const { email, password } = req.body
  const ipAddress = requestIp.getClientIp(req) || '::1'

  const users = await getUserWithEmail({ email })
  const user = users[0]

  if (!user) {
    throw new ServerError(400, ERROR_CODES.INVALID_CREDENTIALS)
  }

  const userPassword = user.password
  const userId = user.id
  const name = user.name

  const isPasswordOk = userPassword ? await bcrypt.compare(password, userPassword) : false

  if (!isPasswordOk) {
    throw new ServerError(400, ERROR_CODES.INVALID_CREDENTIALS)
  }

  const accessToken = createAccessToken({ userId })
  const refreshToken = uuid()

  // Get IP location
  const { data: ipData } = await axios.get<GetIPLocationSuccessResponse>(`http://ip-api.com/json/${ipAddress}`)

  let ipLocation = 'Localhost'

  if (ipData.status === 'success') {
    ipLocation = `${ipData.country}, ${ipData.city}`
  }

  await setUserRefreshToken({ userId, refreshToken, ipAddress, ipLocation })

  res.json({
    success: true,
    data: {
      user: {
        name,
        email,
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
    throw new ServerError(403)
  }

  const userId = user.user_id

  const accessToken = createAccessToken({ userId })
  const newRefreshToken = uuid()

  await updateUserRefreshToken({ oldRefreshToken: refreshToken, newRefreshToken })

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken: newRefreshToken,
    },
  })
}

export const signOutUserHandler = async (req: ServerRequest<SignOutUserBody>, res: ServerResponse) => {
  validationResult(req).throw()

  const { refreshToken } = req.body

  await deleteUserRefreshToken({ refreshToken })

  res.json({
    success: true,
  })
}

export const getUserDevicesHandler = async (req: ServerRequest, res: ServerResponse) => {
  const userId = res.locals.userId

  const devices = await getAllUserTokens({ userId })

  res.json({
    success: true,

    data: devices.map(({ refresh_token, ip_address, ip_location }) => ({
      refreshToken: refresh_token,
      ipAddress: ip_address,
      ipLocation: ip_location,
    })),
  })
}

export const patchUserInfoHandler = async (req: ServerRequest<PatchUserInfoBody>, res: ServerResponse) => {
  validationResult(req).throw()

  const userId = res.locals.userId
  const { name, email } = req.body

  const users = await getUserWithEmail({ email })
  const user = users[0]

  // User with that email already exists
  if (user && userId !== user.id) {
    throw new ServerError(400, ERROR_CODES.INVALID_CREDENTIALS)
  }

  await patchUserInfo({ userId, name, email })

  res.json({
    success: true,
    data: {
      name,
      email,
    },
  })
}

export const patchUserPasswordHandler = async (req: ServerRequest<PatchUserPasswordBody>, res: ServerResponse) => {
  validationResult(req).throw()

  const userId = res.locals.userId
  const { oldPassword, newPassword } = req.body

  const users = await getUserWithId({ id: userId })
  const user = users[0]

  const isPasswordOk = await bcrypt.compare(oldPassword, user.password)

  if (!isPasswordOk) {
    throw new ServerError(400, ERROR_CODES.INVALID_CREDENTIALS)
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12)

  await patchUserPassword({ userId, password: hashedPassword })

  res.json({
    success: true,
  })
}
