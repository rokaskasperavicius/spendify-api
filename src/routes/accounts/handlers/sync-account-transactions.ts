import { z } from 'zod'

import { SYNC_ADMIN_KEY } from '@/lib/constants'
import { ServerError, ServerRequest, ServerResponse } from '@/lib/types'
import { syncTransactions } from '@/lib/utils/sync-transactions'

export const SyncAccountTransactionsSchema = z.object({
  query: z.object({
    admin_key: z.string(),
  }),
})

type Request = z.infer<typeof SyncAccountTransactionsSchema>

/**
 * Replica of the running cron job that syncs transactions
 */
export const syncAccountTransactions = async (
  req: ServerRequest<object, object, Request['query']>,
  res: ServerResponse,
) => {
  const { admin_key } = req.query

  if (admin_key !== SYNC_ADMIN_KEY) {
    throw new ServerError(401)
  }

  await syncTransactions()

  res.json({ success: true })
}
