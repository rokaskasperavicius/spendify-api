// Helpers
import { db } from '@services/db'

type Props = {
  userId: number
}

type LinkedAccount = {
  id: number
  account_id: string
  requisition_id: string
  account_name: string
  account_iban: string
  bank_name: string
  bank_logo: string
}

export const getLinkedAccounts = ({ userId }: Props) => {
  return db<LinkedAccount>(
    `SELECT
      id, account_id, requisition_id, account_name, account_iban, bank_name, bank_logo
      FROM accounts
      WHERE user_id = $1
    `,
    [userId]
  )
}
