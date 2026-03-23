import 'dotenv/config'
import { setupServer } from 'msw/node'
import schedule, { Job } from 'node-schedule'

import { GENAI_CATEGORIZATION_ENABLED, MOCKS_ENABLED, NODE_ENV } from '@/lib/constants'

import { handlers } from '@/mocks/handlers'

import app from './app'
import { syncAccountStatuses } from './lib/utils/sync-account-statuses'
import { syncTransactions } from './lib/utils/sync-transactions'
import { updateCategorizedTransactions } from './lib/utils/update-categorized-transactions'
import { genAiServices } from './services/genai'
import { prismaService } from './services/prisma'

// MSW setup
const server = setupServer(...handlers)

// TODO: Don't need NODE_ENV and evaluate the need for mocks
if (NODE_ENV === 'development' && MOCKS_ENABLED === 'true') {
  server.listen({
    // This is going to perform unhandled requests
    // but print no warning whatsoever when they happen.
    onUnhandledRequest: 'bypass',
  })
}

const port = process.env.PORT || 8080

/**
 * Create a cron job to sync transactions every day at 10 past 3am and 15pm UTC
 *
 * You can check how the cron job parser works here:
 * https://crontab.guru/#0_3,15_*_*_*
 */
schedule.scheduleJob('10 3,15 * * *', async () => {
  // TODO: Add env to control this. False by default
  if (NODE_ENV === 'development') {
    return
  }

  try {
    console.info('[INFO] Running cron job to sync transactions')

    await syncTransactions()
  } catch (error) {
    console.error('Cron job failed to sync transactions with error:', error)
  }
})

/**
 * Create a cron job to sync account status 10 minutes before the transaction sync
 * This is important as the account might become expired (EX) when syncing transactions
 */
schedule.scheduleJob('0 3,15 * * *', async () => {
  // TODO: Add env to control this. False by default
  if (NODE_ENV === 'development') {
    return
  }

  try {
    console.info('[INFO] Running cron job to sync account statuses')

    await syncAccountStatuses()
  } catch (error) {
    console.error('Cron job failed to sync account statuses with error:', error)
  }
})

schedule.scheduleJob('* * * * *', async function (this: Job) {
  console.info('[INFO] TEST CRON')

  this.reschedule('*/2 * * * *')
})

let genAiCronJob = '*/10 * * * *'
/**
 * Create a cron job to run google gen AI every 10 minutes to categorize a batch of transactions
 */
schedule.scheduleJob(genAiCronJob, async () => {
  if (!GENAI_CATEGORIZATION_ENABLED) {
    return
  }

  try {
    console.info('[INFO] Running cron job to categorize transactions with Gen AI')

    const left = await updateCategorizedTransactions(prismaService, genAiServices)

    // Scale down
    if (left === 0) {
      genAiCronJob = '0 * * * *'
    } else {
      genAiCronJob = '*/10 * * * *'
    }
  } catch (error) {
    console.error('Cron job failed to run gen ai:', error)
  }
})

app.listen(port, () => {
  console.log(`⚡️ [SERVER]: Server is running at http://localhost:${port}`)
})
