import { NextFunction } from 'express'

import { ServerError, ServerRequest, ServerResponse } from '@/lib/types'

import prisma from '@/services/prisma'

export const verifyUser = async (req: ServerRequest, res: ServerResponse, next: NextFunction) => {
  const sessionToken = req.signedCookies.session as string | undefined

  if (!sessionToken) {
    throw new ServerError(401)
  }

  const session = await prisma.sessions.findFirst({
    where: {
      session_token: sessionToken,
      expires_at: {
        gt: new Date(),
      },
    },
  })

  if (!session) {
    throw new ServerError(401)
  }

  res.locals.userId = session.user_id
  next()
}
