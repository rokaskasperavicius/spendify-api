import { ServerRequest, ServerResponse } from '@/lib/types'

import prisma from '@/services/prisma'

export const logOut = async (req: ServerRequest, res: ServerResponse) => {
  const sessionToken = req.signedCookies.session

  // If the sessionToken is undefined, prisma deletes all sessions. Thanks prisma :)
  if (sessionToken) {
    await prisma.sessions
      .delete({
        where: {
          session_token: sessionToken,
        },
      })
      .catch((error) => {
        if (error?.code === 'P2025') {
          // This error means that the session was not found, which is not a problem
          // We can just ignore it
          console.log('[ERROR]: Session not found, ignoring')
          return
        }

        throw error
      })
  }

  res.clearCookie('session')

  res.json({
    success: true,
  })
}
