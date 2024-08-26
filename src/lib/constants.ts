export const NODE_ENV = process.env.NODE_ENV as string
export const DATABASE_URL = process.env.DATABASE_URL as string
export const COOKIE_SECRET = process.env.COOKIE_SECRET as string

// Nordigen
export const NORDIGEN_BASE_URL = process.env.NORDIGEN_BASE_URL as string
export const NORDIGEN_SECRET_ID = process.env.NORDIGEN_SECRET_ID as string
export const NORDIGEN_SECRET_KEY = process.env.NORDIGEN_SECRET_KEY as string
export const NORDIGEN_COUNTRY = process.env.NORDIGEN_COUNTRY as string

export const NORDIGEN_ACCESS_VALID_FOR_DAYS = 90
export const NORDIGEN_ACCESS_SCOPE = ['balances', 'details', 'transactions']

export const GOCARDLESS_SANDBOX_INSTITUTION_ID = 'SANDBOXFINANCE_SFIN0000'

// Other
export const NORDIGEN_CURRENCY = { symbol: '', separator: '', decimal: '.' }
export const FORMATTED_CURRENCY = { symbol: '', decimal: ',', separator: '.' }
