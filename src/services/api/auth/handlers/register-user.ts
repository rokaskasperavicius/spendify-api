import bcrypt from 'bcrypt'
import { StatusCodes } from 'http-status-codes'
import { z } from 'zod'

import { ERROR_CODES, ServerError, ServerRequest, ServerResponse } from '@/lib/types'

import prisma from '@/services/prisma'

import { password } from '../utils/password'

export const RegisterUserSchema = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().refine((value) => password.validate(value)),
  }),
})

type Request = z.infer<typeof RegisterUserSchema>

export const registerUser = async (req: ServerRequest<Request['body']>, res: ServerResponse) => {
  const { name, email, password } = req.body

  const user = await prisma.users.findFirst({ where: { email } })

  if (user) {
    throw new ServerError(StatusCodes.CONFLICT, ERROR_CODES.INVALID_CREDENTIALS)
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await prisma.users.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  })

  res.json({
    success: true,
  })
}