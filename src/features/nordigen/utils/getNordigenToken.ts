// Helpers
import { db } from '@services/db'

type NordigenToken = {
  access_token: string
}

export const getNordigenToken = () => db<NordigenToken>('SELECT access_token FROM nordigen')
