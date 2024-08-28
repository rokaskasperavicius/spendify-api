import { ServerRequest, ServerResponse } from '@/lib/types'

import { gocardlessCurrency } from '@/services/gocardless/utils/currency'
import prisma from '@/services/prisma'

export const getAccounts = async (req: ServerRequest, res: ServerResponse) => {
  const accounts = await prisma.accounts.findMany({
    where: {
      users: {
        some: {
          id: res.locals.userId,
        },
      },
    },
  })

  res.json({
    success: true,
    data: {
      accounts: accounts.map((account) => ({
        id: account.id,
        name: account.name,
        iban: account.iban,
        balance: gocardlessCurrency(account.balance).format(),
        institutionName: account.institution_name,
        institutionLogo: account.institution_logo,
        lastSyncedAt: account.last_synced,
      })),
    },
  })
}
