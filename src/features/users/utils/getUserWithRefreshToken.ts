// Helpers
import { db } from '@services/db'

type Props = {
  refreshToken: string
}

type UserTokenProps = {
  id: number
}

export const getUserWithRefreshToken = ({ refreshToken }: Props) => {
  return db<UserTokenProps>('SELECT id FROM users where refresh_token = $1', [refreshToken])
}
