// Helpers
import { nordigenApi } from '@services/nordigenApi'

type NordigenAccountDetails = {
  transactions: {
    booked: NordigenBookedTransactions[]
  }
}

type NordigenBookedTransactions = {
  transactionId: string
  entryReference?: string
  bookingDate: string
  valueDate: string
  transactionAmount: {
    amount: string
    currency: string
  }
  debtorName: string
  debtorAccount: {
    iban: string
    bban: string
    currency: string
  }
  remittanceInformationUnstructuredArray: string[]
  internalTransactionId: string
}

type Props = {
  accountId: string
}

export const getNordigenAccountTransactions = ({ accountId }: Props) =>
  nordigenApi.get<NordigenAccountDetails>(`/accounts/${accountId}/transactions/`)
