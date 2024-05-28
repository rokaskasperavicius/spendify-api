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
import crypto from 'node:crypto'
import { validationResult } from 'express-validator'
import requestIp from 'request-ip'

// Helpers
import { getUserWithEmail, createUser, getUserWithId, patchUserInfo, patchUserPassword } from '@layers/database'

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
import prisma from '@layers/database/db'
import { NODE_ENV } from '@global/constants'

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

  const user = await prisma.users.findFirst({ where: { email } })

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

  // Get IP location
  const { data: ipData } = await axios.get<GetIPLocationSuccessResponse>(`http://ip-api.com/json/${ipAddress}`)

  let ipLocation = 'Localhost'

  if (ipData.status === 'success') {
    ipLocation = `${ipData.country}, ${ipData.city}`
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week expiration
  const sessionToken = crypto.randomUUID()

  await prisma.sessions.create({
    data: {
      user_id: userId,
      expires_at: expiresAt,
      session_token: sessionToken,
      ip_address: ipAddress,
      ip_location: ipLocation,
    },
  })

  res.cookie('session', sessionToken, {
    domain: NODE_ENV === 'production' ? 'spendify.dk' : 'localhost',
    path: '/',
    httpOnly: true,
    secure: true,
    signed: true,
    sameSite: 'strict',
    expires: expiresAt,
  })

  res.json({
    success: true,
    data: {
      user: {
        name,
        email,
      },
    },
  })
}

export const destroySessionHandler = async (req: ServerRequest<SignOutUserBody>, res: ServerResponse) => {
  validationResult(req).throw()

  const { sessionId } = req.body

  await prisma.sessions.deleteMany({
    where: {
      session_token: sessionId,
    },
  })

  res.json({
    success: true,
  })
}

export const logOutHandler = async (req: ServerRequest, res: ServerResponse) => {
  const sessionToken = req.signedCookies.session

  await prisma.sessions.deleteMany({
    where: {
      session_token: sessionToken,
    },
  })

  res.clearCookie('session')

  res.json({
    success: true,
  })
}

export const getUserSessionsHandler = async (req: ServerRequest, res: ServerResponse) => {
  const userId = res.locals.userId
  const sessionToken = req.signedCookies.session

  const devices = await prisma.sessions.findMany({
    where: {
      user_id: userId,
    },
  })

  res.json({
    success: true,

    data: devices.map(({ session_token, ip_address, ip_location }) => ({
      isCurrent: session_token === sessionToken,
      sessionId: session_token,
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
