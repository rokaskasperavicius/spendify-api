import { TransactionStatus } from '@prisma/client'

import prisma from './index'

const finalizeTransactionCategorization = async (
  transactionId: string,
  transactionAiCategory: string,
): Promise<void> => {
  await prisma.transactions.update({
    where: { id: transactionId },
    data: {
      category_ai: transactionAiCategory,
      status: TransactionStatus.FINISHED,
    },
  })
}

export { finalizeTransactionCategorization }
