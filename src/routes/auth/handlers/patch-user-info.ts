import { StatusCodes } from 'http-status-codes'
import { z } from 'zod'

import { ERROR_CODES, ServerError, ServerRequest, ServerResponse } from '@/lib/types'

import prisma from '@/services/prisma'

export const PatchUserInfoSchema = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
})

type Request = z.infer<typeof PatchUserInfoSchema>

export const patchUserInfo = async (req: ServerRequest<Request['body']>, res: ServerResponse) => {
  const userId = res.locals.userId
  const { name, email } = req.body

  const user = await prisma.users.findFirst({ where: { email } })

  // User with that email already exists
  if (user && userId !== user.id) {
    throw new ServerError(StatusCodes.CONFLICT, ERROR_CODES.INVALID_CREDENTIALS)
  }

  await prisma.users.update({
    where: { id: userId },
    data: {
      name,
      email,
    },
  })

  res.json({
    success: true,
    data: {
      name,
      email,
    },
  })
}
