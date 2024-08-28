import { ServerRequest, ServerResponse } from '@/lib/types'

import prisma from '@/services/prisma'

export const getUserSessions = async (req: ServerRequest, res: ServerResponse) => {
  const userId = res.locals.userId
  const sessionToken = req.signedCookies.session

  const devices = await prisma.sessions.findMany({
    where: {
      user_id: userId,
    },
  })

  res.json({
    success: true,

    data: devices.map(({ session_token, ip_address, ip_location }) => ({
      isCurrent: session_token === sessionToken,
      sessionId: session_token,
      ipAddress: ip_address,
      ipLocation: ip_location,
    })),
  })
}
