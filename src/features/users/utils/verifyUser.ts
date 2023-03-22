import { NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// Types
import { ServerError, ServerRequest, ServerResponse } from '@types'

export const verifyUser = async (req: ServerRequest, res: ServerResponse, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    throw new ServerError(401)
  }

  try {
    const tokenInfo = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY as string) as jwt.JwtPayload
    console.log({ tokenInfo })
    res.locals.userId = tokenInfo.id

    next()
  } catch (err) {
    throw new ServerError(401)
  }
}
