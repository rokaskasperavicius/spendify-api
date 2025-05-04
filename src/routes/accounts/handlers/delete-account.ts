import { z } from 'zod'

import { ServerRequest, ServerResponse } from '@/lib/types'

import prisma from '@/services/prisma'

export const DeleteAccountSchema = z.object({
  body: z.object({
    accountId: z.string(),
  }),
})

type Request = z.infer<typeof DeleteAccountSchema>

/**
 * This removes connection between the user and account
 * and deletes the account if no other users are connected to it
 */
export const deleteAccount = async (req: ServerRequest<Request['body']>, res: ServerResponse) => {
  const { userId } = res.locals
  const { accountId } = req.body

  await prisma.accounts.delete({
    where: {
      id: accountId,
      user_id: userId,
    },
  })

  res.json({
    success: true,
  })
}
