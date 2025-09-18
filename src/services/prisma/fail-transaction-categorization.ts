import { TransactionStatus } from '@prisma/client'

import prisma from './index'

const failTransactionCategorization = async (batchIds: string[]): Promise<void> => {
  await prisma.transactions.updateMany({
    where: {
      id: {
        in: batchIds,
      },
    },
    data: {
      status: TransactionStatus.FAILED,
    },
  })
}

export { failTransactionCategorization }
