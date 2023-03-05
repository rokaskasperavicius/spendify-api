// Helpers
import { db } from '@services/db'

type Props = {
  userId: number
  accountId: string
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

export const getLinkedAccount = ({ userId, accountId }: Props) => {
  return db<LinkedAccount>(
    `SELECT
      id, account_id, requisition_id, account_name, account_iban, bank_name, bank_logo
      FROM accounts
      WHERE user_id = $1 AND account_id = $2
    `,
    [userId, accountId]
  )
}
