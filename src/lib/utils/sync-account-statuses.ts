import { getRequisitionById } from '@/services/gocardless/api'
import prisma from '@/services/prisma'

export const syncAccountStatuses = async () => {
  const accounts = await prisma.accounts.findMany()

  for (const account of accounts) {
    try {
      const { data: requisition } = await getRequisitionById(account.requisitionId)

      // Update the account status
      await prisma.accounts.update({
        where: {
          id: account.id,
        },
        data: {
          status: requisition?.status,
        },
      })
    } catch (error) {
      console.error(`Error syncing transactions for account ${account.id} with error: ${error}`)
    }
  }
}
