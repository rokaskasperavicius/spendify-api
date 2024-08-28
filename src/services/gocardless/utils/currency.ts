import currency from 'currency.js'

import { FORMATTED_CURRENCY, GOCARDLESS_CURRENCY } from '@/lib/constants'

export const gocardlessCurrency = (amount: string | number | undefined = 0) => {
  return {
    ...currency(amount, GOCARDLESS_CURRENCY),

    subtract: (number: currency.Any) => currency(amount, GOCARDLESS_CURRENCY).subtract(number),
    format: () => currency(amount, GOCARDLESS_CURRENCY).format(FORMATTED_CURRENCY),
  }
}
