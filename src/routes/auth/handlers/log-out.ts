import { ServerRequest, ServerResponse } from '@/lib/types'

import prisma from '@/services/prisma'

export const logOut = async (req: ServerRequest, res: ServerResponse) => {
  const sessionToken = req.signedCookies.session

  // If the sessionToken is undefined, prisma deletes all sessions. Thanks prisma :)
  if (sessionToken) {
    await prisma.sessions.deleteMany({
      where: {
        session_token: sessionToken,
      },
    })
  }

  res.clearCookie('session')

  res.json({
    success: true,
  })
}
