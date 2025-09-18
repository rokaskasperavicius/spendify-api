import { IGenAiServices } from '@/services/genai'
import { IPrismaService } from '@/services/prisma'

const updateCategorizedTransactions = async (prismaService: IPrismaService, genAiServices: IGenAiServices) => {
  // Get a batch of uncategorized transactions
  const batch = await prismaService.findTransactionBatches(20) // default 100

  if (batch.length === 0) {
    return
  }

  // Set the batch status to processing
  await prismaService.updateBatchTransactionStatus(batch.map((tx) => tx.id))

  try {
    // Run LLM to categorize the transactions
    const categorized = await genAiServices.categorizeTransactions(batch)

    // Update the transactions with the categorized data
    await Promise.all(categorized.map((c) => prismaService.finalizeTransactionCategorization(c.id, c.category_ai)))
  } catch (error) {
    // Set the batch status to failed
    await prismaService.failTransactionCategorization(batch.map((tx) => tx.id))

    throw error
  }
}

export { updateCategorizedTransactions }
