// JWT
export const JWT_ACCESS_SECRET_KEY = process.env.JWT_ACCESS_SECRET_KEY as string
export const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY as string
export const JWT_ACCESS_EXPIRATION = '15m'
export const JWT_REFRESH_EXPIRATION = '5d'

// Nordigen
export const NORDIGEN_BASE_URL = process.env.NORDIGEN_BASE_URL as string
export const NORDIGEN_SECRET_ID = process.env.NORDIGEN_SECRET_ID as string
export const NORDIGEN_SECRET_KEY = process.env.NORDIGEN_SECRET_KEY as string
export const NORDIGEN_COUNTRY = process.env.NORDIGEN_COUNTRY as string

// Mocked Data
export const MOCKED_USER_ID = 16
