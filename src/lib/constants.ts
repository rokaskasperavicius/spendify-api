// Global
export const NODE_ENV = process.env.NODE_ENV as string
export const MOCKS_ENABLED = process.env.MOCKS_ENABLED as string
export const DATABASE_URL = process.env.DATABASE_URL as string
export const COOKIE_SECRET = process.env.COOKIE_SECRET as string
export const SYNC_ADMIN_KEY = process.env.SYNC_ADMIN_KEY as string

// GoCardless
export const GOCARDLESS_BASE_URL = process.env.GOCARDLESS_BASE_URL as string
export const GOCARDLESS_SECRET_ID = process.env.GOCARDLESS_SECRET_ID as string
export const GOCARDLESS_SECRET_KEY = process.env.GOCARDLESS_SECRET_KEY as string
export const GOCARDLESS_COUNTRY = process.env.GOCARDLESS_COUNTRY as string

export const GOCARDLESS_ACCESS_VALID_FOR_DAYS = 90
export const GOCARDLESS_ACCESS_SCOPE = ['balances', 'details', 'transactions']

export const GOCARDLESS_SANDBOX_INSTITUTION_ID = 'SANDBOXFINANCE_SFIN0000'

// Other
export const GOCARDLESS_CURRENCY = { symbol: '', separator: '', decimal: '.' }
export const FORMATTED_CURRENCY = { symbol: '', decimal: ',', separator: '.' }
export const PASSWORD_SALT_ROUNDS = 12
