import { ServerRequest, ServerResponse } from '@/global/types'

import prisma from '@/layers/database/db'

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
        balance: account.balance,
        institutionName: account.institution_name,
        institutionLogo: account.institution_logo,
      })),
    },
  })
}
