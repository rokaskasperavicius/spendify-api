import currency from 'currency.js'

import { FORMATTED_CURRENCY, NORDIGEN_CURRENCY } from '@/global/constants'

export const gocardlessCurrency = (amount: string | number | undefined = 0) => ({
  ...currency(amount, NORDIGEN_CURRENCY),

  format: () => {
    return currency(amount, NORDIGEN_CURRENCY).format(FORMATTED_CURRENCY)
  },
})

class GoCardlessTokens {
  accessToken?: string
  refreshToken?: string

  constructor(accessToken?: string, refreshToken?: string) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
  }

  setAccessToken(token?: string) {
    this.accessToken = token
  }

  setRefreshToken(token?: string) {
    this.refreshToken = token
  }

  getAccessToken() {
    return this.accessToken
  }

  getRefreshToken() {
    return this.refreshToken
  }
}

export default new GoCardlessTokens(undefined, undefined)
