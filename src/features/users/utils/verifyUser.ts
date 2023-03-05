import { NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// Helpers
import { getUserWithToken } from '@features/users/utils/getUserWithToken'

// Types
import { ServerError, ServerRequest, ServerResponse } from '@types'

export const verifyUser = async (req: ServerRequest, res: ServerResponse, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]

  const user = token ? await getUserWithToken({ token }) : []

  if (!user[0]?.id || !token) {
    throw new ServerError(401)
  }

  try {
    jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY as string)

    res.locals.userId = user[0].id

    next()
  } catch (err) {
    throw new ServerError(401)
  }
}
