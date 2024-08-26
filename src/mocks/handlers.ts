import { HttpResponse, http } from 'msw'

import { NORDIGEN_BASE_URL } from '@/lib/constants'

import { transactions } from './transactions'

export const handlers = [
  http.get(`${NORDIGEN_BASE_URL}/accounts/:accountId/`, () => {
    return HttpResponse.json({
      id: '3e4d3011-95d5-46d4-b3a7-7805d777cdc7',
      created: '2024-08-25T18:09:30.440650Z',
      last_accessed: '2024-08-25T18:10:17.752208Z',
      iban: 'GL0731820000031823',
      institution_id: 'SANDBOXFINANCE_SFIN0000',
      status: 'READY',
      owner_name: 'Jane Doe',
      succer: true,
    })
  }),

  http.get(`${NORDIGEN_BASE_URL}/accounts/:accountId/details/`, () => {
    return HttpResponse.json({
      account: {
        resourceId: '01F3NS5ASCNMVCTEJDT0G215YE',
        iban: 'GL0731820000031823',
        currency: 'EUR',
        ownerName: 'Jane Doe',
        name: 'Main Account',
        product: 'Checkings',
        cashAccountType: 'CACC',
      },
    })
  }),

  http.get(`${NORDIGEN_BASE_URL}/accounts/:accountId/balances/`, () => {
    return HttpResponse.json({
      balances: [
        {
          balanceAmount: {
            // amount: '1913.12',
            amount: '1903.12',
            currency: 'EUR',
          },
          balanceType: 'expected',
          referenceDate: '2024-08-25',
        },
        {
          balanceAmount: {
            // amount: '1913.12',
            amount: '1903.12',
            currency: 'EUR',
          },
          balanceType: 'interimAvailable',
          referenceDate: '2024-08-25',
        },
      ],
    })
  }),

  http.get(`${NORDIGEN_BASE_URL}/accounts/:accountId/transactions/`, () => {
    return HttpResponse.json(transactions)
  }),
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const test = {
  transactions: {
    booked: [
      {
        transactionId: 'first2',
        bookingDate: '2024-08-24',
        valueDate: '2024-08-24',
        transactionAmount: {
          amount: '-4.00',
          currency: 'EUR',
        },
        remittanceInformationUnstructured: 'asdasPAYMENT Alderaan Coffe',
        bankTransactionCode: 'PMNT',
      },
      {
        transactionId: 'second',
        bookingDate: '2024-08-24',
        valueDate: '2024-08-24',
        transactionAmount: {
          amount: '-6.00',
          currency: 'EUR',
        },
        remittanceInformationUnstructured: '4434 Alderaan Coffe',
        bankTransactionCode: 'PMNT',
      },
      {
        transactionId: '2024082401773508-1',
        bookingDate: '2024-08-24',
        valueDate: '2024-08-24',
        transactionAmount: {
          amount: '-15.00',
          currency: 'EUR',
        },
        remittanceInformationUnstructured: 'PAYMENT Alderaan Coffe',
        bankTransactionCode: 'PMNT',
      },
      {
        transactionId: '2024082401773507-1',
        bookingDate: '2024-08-24',
        valueDate: '2024-08-24',
        transactionAmount: {
          amount: '45.00',
          currency: 'EUR',
        },
        debtorName: 'MON MOTHMA',
        debtorAccount: {
          iban: 'GL4888530000088535',
        },
        remittanceInformationUnstructured: 'For the support of Restoration of the Republic foundation',
        bankTransactionCode: 'PMNT',
      },
    ],
  },
}
