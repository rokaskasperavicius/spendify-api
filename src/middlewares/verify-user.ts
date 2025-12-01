import { NextFunction } from 'express'

import { ERROR_CODES, ServerError, ServerRequest, ServerResponse } from '@/lib/types'

import prisma from '@/services/prisma'

export const verifyUser = async (req: ServerRequest, res: ServerResponse, next: NextFunction) => {
  const sessionToken = req.signedCookies.session as string | undefined
  console.log('[INFO] Verifying user with session token:', sessionToken)

  // https://github.com/prisma/prisma/issues/5149 xd
  if (!sessionToken) {
    console.info('[INFO] No session token found in cookies')
    throw new ServerError(401, ERROR_CODES.UNAUTHORIZED)
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
    console.info('[INFO] No valid session found')
    throw new ServerError(401, ERROR_CODES.UNAUTHORIZED)
  }

  res.locals.userId = session.user_id
  next()
}
