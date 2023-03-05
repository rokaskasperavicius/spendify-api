// Helpers
import { nordigenApi } from '@services/nordigenApi'

type NordigenAccountBalances = {
  balances: {
    balanceAmount: {
      amount: string
      currency: string
    }

    balanceType: string
    creditLimitIncluded: boolean
    referenceDate: string
  }[]
}

type Props = {
  accountId: string
}

export const getNordigenAccountBalances = ({ accountId }: Props) =>
  nordigenApi.get<NordigenAccountBalances>(`/accounts/${accountId}/balances/`)
