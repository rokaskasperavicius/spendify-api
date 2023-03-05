// Helpers
import { nordigenApi } from '@services/nordigenApi'

type NordigenAccountDetails = {
  account: {
    resourceId: string
    iban: string
    bban: string
    currency: string
    ownerName: string
    name: string
    cashAccountType: string
    bic: string
    usage: string
  }
}

type Props = {
  accountId: string
}

export const getNordigenAccountDetails = ({ accountId }: Props) =>
  nordigenApi.get<NordigenAccountDetails>(`/accounts/${accountId}/details/`)
