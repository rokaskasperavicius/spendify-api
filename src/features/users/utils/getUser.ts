// Helpers
import { db } from '@services/db'

type Props = {
  email: string
}

type UserProps = {
  id: number
  password: string
  first_name: string
  last_name: string
  access_token: string
  refresh_token: string
}

export const getUser = ({ email }: Props) => {
  return db<UserProps>(
    `SELECT
      id, password, first_name, last_name, access_token, refresh_token 
      FROM users
      WHERE email = $1
    `,
    [email]
  )
}
