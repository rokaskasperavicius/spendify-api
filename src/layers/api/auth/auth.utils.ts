/*
|--------------------------------------------------------------------------
| Auth Utils
|--------------------------------------------------------------------------
|
| Here you define all of the utility (helpers) functions for the auth endpoint
|
*/

import jwt from 'jsonwebtoken'

// Constants
import { JWT_ACCESS_SECRET_KEY, JWT_ACCESS_EXPIRATION } from '@global/constants'

export const createAccessToken = ({ userId }: { userId: number }) =>
  jwt.sign({ id: userId }, JWT_ACCESS_SECRET_KEY, {
    expiresIn: JWT_ACCESS_EXPIRATION,
  })
