import { HttpResponse, http } from 'msw'

import { GOCARDLESS_BASE_URL } from '@/lib/constants'

import { balances } from './balances'
import { details } from './details'
import { metadata } from './metadata'
import { transactions } from './transactions'

export const handlers = [
  http.get(`${GOCARDLESS_BASE_URL}/accounts/:accountId/`, () => {
    return HttpResponse.json(metadata)
  }),

  http.get(`${GOCARDLESS_BASE_URL}/accounts/:accountId/details/`, () => {
    return HttpResponse.json(details)
  }),

  http.get(`${GOCARDLESS_BASE_URL}/accounts/:accountId/balances/`, () => {
    return HttpResponse.json(balances)
  }),

  http.get(`${GOCARDLESS_BASE_URL}/accounts/:accountId/transactions/`, () => {
    return HttpResponse.json(transactions)
  }),
]
