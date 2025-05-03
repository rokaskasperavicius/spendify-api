import { getAccountMetadata } from '@/services/gocardless/api'
import prisma from '@/services/prisma'

export const syncAccountStatuses = async () => {
  const accounts = await prisma.accounts.findMany()

  for (const account of accounts) {
    try {
      const { data: metadata } = await getAccountMetadata(account.id)

      // Update the account status
      await prisma.accounts.update({
        where: {
          id: account.id,
        },
        data: {
          status: metadata.status,
        },
      })
    } catch (error) {
      console.error(`Error syncing transactions for account ${account.id} with error: ${error}`)
    }
  }
}
