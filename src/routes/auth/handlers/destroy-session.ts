import { z } from 'zod'

import { ServerRequest, ServerResponse } from '@/lib/types'

import prisma from '@/services/prisma'

export const DestroySessionSchema = z.object({
  body: z.object({
    sessionId: z.string(),
  }),
})

type Request = z.infer<typeof DestroySessionSchema>

export const destroySession = async (req: ServerRequest<Request['body']>, res: ServerResponse) => {
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
