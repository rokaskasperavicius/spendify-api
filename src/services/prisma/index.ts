import { PrismaClient, Transactions } from '@prisma/client'

import { failTransactionCategorization } from './fail-transaction-categorization'
import { finalizeTransactionCategorization } from './finalize-transaction-categorization'
import { findTransactionBatches } from './find-transaction-batches'
import { updateBatchTransactionStatus } from './update-batch-transaction-status'

const prisma = new PrismaClient()

interface IPrismaService {
  findTransactionBatches: (batchCount: number) => Promise<Transactions[]>
  updateBatchTransactionStatus: (batchIds: string[]) => Promise<void>
  failTransactionCategorization: (batchIds: string[]) => Promise<void>
  finalizeTransactionCategorization: (transactionId: string, transactionAiCategory: string) => Promise<void>
}

const prismaService: IPrismaService = {
  findTransactionBatches: findTransactionBatches,
  updateBatchTransactionStatus: updateBatchTransactionStatus,
  failTransactionCategorization: failTransactionCategorization,
  finalizeTransactionCategorization: finalizeTransactionCategorization,
}

export default prisma
export { IPrismaService, prismaService }
