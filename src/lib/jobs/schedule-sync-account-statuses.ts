import schedule from 'node-schedule'

import { SYNC_ACCOUNT_STATUSES_ENABLED } from '@/lib/constants'
import { syncAccountStatuses } from '@/lib/utils/sync-account-statuses'

/**
 * Create a cron job to sync account status 10 minutes before the transaction sync
 * This is important as the account might become expired (EX) when syncing transactions
 */
export const scheduleSyncAccountStatuses = () => {
  schedule.scheduleJob('0 3,15 * * *', async () => {
    if (!SYNC_ACCOUNT_STATUSES_ENABLED) return

    console.info('[INFO] Running cron job to sync account statuses')
    await syncAccountStatuses()
  })
}
