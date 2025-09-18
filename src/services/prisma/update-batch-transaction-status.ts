import { TransactionStatus } from '@prisma/client'

import prisma from './index'

const updateBatchTransactionStatus = async (batchIds: string[]): Promise<void> => {
  await prisma.transactions.updateMany({
    where: {
      id: {
        in: batchIds,
      },
    },
    data: {
      status: TransactionStatus.PROCESSING,
    },
  })
}

export { updateBatchTransactionStatus }
