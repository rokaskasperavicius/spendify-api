import currency from 'currency.js'

import { FORMATTED_CURRENCY, NORDIGEN_CURRENCY } from './constants'

export const dkk = (value: string | undefined) => {
  return currency(value || '0', NORDIGEN_CURRENCY).format(FORMATTED_CURRENCY)
}

// export const dkk_substract = (total: string | undefined, substract: string) => {
//   return currency(value || '0', NORDIGEN_CURRENCY).format(FORMATTED_CURRENCY)
// }
