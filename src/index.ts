import 'dotenv/config'
import { setupServer } from 'msw/node'
import schedule from 'node-schedule'

import { MOCKS_ENABLED, NODE_ENV } from '@/lib/constants'

import { handlers } from '@/mocks/handlers'

import app from './app'
import { syncAccountStatuses } from './lib/utils/sync-account-statuses'
import { syncTransactions } from './lib/utils/sync-transactions'

// MSW setup
const server = setupServer(...handlers)

if (NODE_ENV === 'development' && MOCKS_ENABLED === 'true') {
  server.listen({
    // This is going to perform unhandled requests
    // but print no warning whatsoever when they happen.
    onUnhandledRequest: 'bypass',
  })
}

const port = process.env.PORT || 8080

/**
 * Create a cron job to sync transactions every day at 3am and 15pm UTC
 *
 * You can check how the cron job parser works here:
 * https://crontab.guru/#0_3,15_*_*_*
 */
schedule.scheduleJob('0 3,15 * * *', async () => {
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
 * Create a cron job to sync account status 10 minutes after the transaction sync
 * This is important as the account might become EXPIRED when syncing transactions
 */
schedule.scheduleJob('10 3,15 * * *', async () => {
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

app.listen(port, () => {
  console.log(`⚡️ [SERVER]: Server is running at http://localhost:${port}`)
})
