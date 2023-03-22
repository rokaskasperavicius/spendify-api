// Helpers
import { db } from '@services/db'

import nordigenAccess from '@config/nordigenAccess'

type NordigenToken = {
  access_token: string
}

export const getNordigenToken = () => {
  // db<NordigenToken>('SELECT access_token FROM nordigen')
  console.log(nordigenAccess.getAccessToken())
  return [{ access_token: nordigenAccess.getAccessToken() }]
}
