import { Transactions } from '@prisma/client'

import prisma from './index'

const findTransactionBatches = async (batchCount: number): Promise<Transactions[]> => {
  return await prisma.transactions.findMany({
    orderBy: {
      date: 'desc',
    },
    where: {
      status: null,
    },

    take: batchCount,
  })
}

export { findTransactionBatches }
