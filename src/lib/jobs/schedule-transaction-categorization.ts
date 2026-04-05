import schedule, { Job } from 'node-schedule'

import { GENAI_CATEGORIZATION_ENABLED } from '@/lib/constants'
import { updateCategorizedTransactions } from '@/lib/utils/update-categorized-transactions'

import { genAiServices } from '@/services/genai'
import { prismaService } from '@/services/prisma'

/**
 * Create a cron job to run google gen AI every 10 minutes to categorize a batch of transactions
 * If no transactions, downscales to run every hour
 */
export const scheduleTransactionCategorization = () => {
  schedule.scheduleJob('*/10 * * * *', async function (this: Job) {
    if (!GENAI_CATEGORIZATION_ENABLED) return

    try {
      console.info('[INFO] Running cron job to categorize transactions with Gen AI')

      const left = await updateCategorizedTransactions(prismaService, genAiServices)

      if (left === 0) {
        this.reschedule('0 * * * *') // scale down to every hour
      } else {
        this.reschedule('*/10 * * * *') // back to normal
      }
    } catch (error) {
      console.error('Cron job failed to run gen ai:', error)
    }
  })
}
