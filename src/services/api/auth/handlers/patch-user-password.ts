import bcrypt from 'bcrypt'
import { StatusCodes } from 'http-status-codes'
import { z } from 'zod'

import { ERROR_CODES, ServerError, ServerRequest, ServerResponse } from '@/lib/types'

import prisma from '@/services/prisma'

import { password } from '../utils/password'

export const PatchUserPasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string(),
    newPassword: z.string().refine((value) => password.validate(value)),
  }),
})

type Request = z.infer<typeof PatchUserPasswordSchema>

export const patchUserPassword = async (req: ServerRequest<Request['body']>, res: ServerResponse) => {
  const userId = res.locals.userId
  const { oldPassword, newPassword } = req.body

  const user = await prisma.users.findFirst({ where: { id: userId } })

  if (!user) {
    throw new ServerError(StatusCodes.BAD_REQUEST)
  }

  const isPasswordOk = await bcrypt.compare(oldPassword, user.password)

  if (!isPasswordOk) {
    throw new ServerError(StatusCodes.BAD_REQUEST, ERROR_CODES.INVALID_CREDENTIALS)
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12)

  await prisma.users.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  })

  res.json({
    success: true,
  })
}
