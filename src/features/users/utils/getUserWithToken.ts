// Helpers
import { db } from '@services/db'

type Props = {
  token: string
}

type UserTokenProps = {
  id: number
}

export const getUserWithToken = ({ token }: Props) => {
  return db<UserTokenProps>('SELECT id FROM users where access_token = $1', [token])
}
