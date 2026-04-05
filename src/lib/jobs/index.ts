import { scheduleSyncAccountStatuses } from '@/lib/jobs/schedule-sync-account-statuses'
import { scheduleSyncTransactions } from '@/lib/jobs/schedule-sync-transactions'
import { scheduleTransactionCategorization } from '@/lib/jobs/schedule-transaction-categorization'

export const scheduleJobs = () => {
  scheduleSyncTransactions()
  scheduleSyncAccountStatuses()
  scheduleTransactionCategorization()
}
