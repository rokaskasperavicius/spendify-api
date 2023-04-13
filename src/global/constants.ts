// JWT
export const JWT_ACCESS_SECRET_KEY = process.env.JWT_ACCESS_SECRET_KEY as string
export const JWT_ACCESS_EXPIRATION = '5m'

// Nordigen
export const NORDIGEN_BASE_URL = process.env.NORDIGEN_BASE_URL as string
export const NORDIGEN_SECRET_ID = process.env.NORDIGEN_SECRET_ID as string
export const NORDIGEN_SECRET_KEY = process.env.NORDIGEN_SECRET_KEY as string
export const NORDIGEN_COUNTRY = process.env.NORDIGEN_COUNTRY as string

export const NORDIGEN_MAX_HISTORICAL_DAYS = 720
export const NORDIGEN_ACCESS_VALID_FOR_DAYS = 30
export const NORDIGEN_ACCESS_SCOPE = ['balances', 'details', 'transactions']

// Mocked Data
export const MOCKED_USER_ID = 16

// Other
export const NORDIGEN_CURRENCY = { symbol: '', separator: '', decimal: '.' }
export const FORMATTED_CURRENCY = { symbol: '', decimal: ',', separator: '.' }
