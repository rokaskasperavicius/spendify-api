import { ServerRequest, ServerResponse } from '@/lib/types'

import { getAccountMetadata } from '@/services/gocardless/api'
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

  // Attach extra account details
  const accountsWithStatus = accounts.map(async (account) => {
    const { data: metadata } = await getAccountMetadata(account.id)

    return {
      id: account.id,
      name: account.name,
      iban: account.iban,
      status: metadata.status,
      balance: gocardlessCurrency(account.balance).format(),
      institutionId: metadata.institution_id,
      institutionName: account.institution_name,
      institutionLogo: account.institution_logo,
      lastSyncedAt: account.last_synced,
    }
  })

  const resolved = await Promise.all(accountsWithStatus)

  res.json({
    success: true,
    data: {
      accounts: resolved,
    },
  })
}
