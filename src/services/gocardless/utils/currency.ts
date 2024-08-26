import currency from 'currency.js'

import { FORMATTED_CURRENCY, NORDIGEN_CURRENCY } from '@/lib/constants'

export const gocardlessCurrency = (amount: string | number | undefined = 0) => {
  return {
    ...currency(amount, NORDIGEN_CURRENCY),

    subtract: (number: currency.Any) => currency(amount, NORDIGEN_CURRENCY).subtract(number),
    format: () => currency(amount, NORDIGEN_CURRENCY).format(FORMATTED_CURRENCY),
  }
}
