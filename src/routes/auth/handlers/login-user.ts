import axios from 'axios'
import bcrypt from 'bcrypt'
import { StatusCodes } from 'http-status-codes'
import crypto from 'node:crypto'
import requestIp from 'request-ip'
import { z } from 'zod'

import { NODE_ENV } from '@/lib/constants'
import { ERROR_CODES, ServerError, ServerRequest, ServerResponse } from '@/lib/types'

import prisma from '@/services/prisma'

import { GetIPLocationSuccessResponse } from '../types'

export const LoginUserSchema = z.object({
  body: z.object({
    email: z.string(),
    password: z.string(),
  }),
})

type Request = z.infer<typeof LoginUserSchema>

export const loginUser = async (req: ServerRequest<Request['body']>, res: ServerResponse) => {
  const { email, password } = req.body
  const ipAddress = requestIp.getClientIp(req) || '::1'

  const user = await prisma.users.findFirst({ where: { email } })

  if (!user) {
    throw new ServerError(StatusCodes.BAD_REQUEST, ERROR_CODES.INVALID_CREDENTIALS)
  }

  const userPassword = user.password
  const userId = user.id
  const name = user.name

  const isPasswordOk = userPassword ? await bcrypt.compare(password, userPassword) : false

  if (!isPasswordOk) {
    throw new ServerError(StatusCodes.BAD_REQUEST, ERROR_CODES.INVALID_CREDENTIALS)
  }

  // Get IP location
  const { data: ipData } = await axios.get<GetIPLocationSuccessResponse>(`http://ip-api.com/json/${ipAddress}`)

  let ipLocation = 'Localhost'

  if (ipData.status === 'success') {
    ipLocation = `${ipData.country}, ${ipData.city}`
  }

  const expiresAt = new Date()
  expiresAt.setMonth(expiresAt.getMonth() + 1) // 1 month expiration

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
    domain: NODE_ENV === 'production' ? 'spendify.dk' : undefined,
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
