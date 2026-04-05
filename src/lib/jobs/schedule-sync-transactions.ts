import schedule from 'node-schedule'

import { SYNC_TRANSACTIONS_ENABLED } from '@/lib/constants'
import { syncTransactions } from '@/lib/utils/sync-transactions'

/**
 * Create a cron job to sync transactions every day at 10 past 3am and 15pm UTC
 */
export const scheduleSyncTransactions = () => {
  schedule.scheduleJob('10 3,15 * * *', async () => {
    if (!SYNC_TRANSACTIONS_ENABLED) return

    console.info('[INFO] Running cron job to sync transactions')
    await syncTransactions()
  })
}
