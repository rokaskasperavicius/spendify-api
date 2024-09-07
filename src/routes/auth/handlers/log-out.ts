import { ServerRequest, ServerResponse } from '@/lib/types'

import prisma from '@/services/prisma'

export const logOut = async (req: ServerRequest, res: ServerResponse) => {
  const sessionToken = req.signedCookies.session

  console.log('sessionToken', sessionToken)

  await prisma.sessions.deleteMany({
    where: {
      session_token: sessionToken,
    },
  })

  res.clearCookie('session')

  res.json({
    success: true,
  })
}
