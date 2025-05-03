import { z } from 'zod'

import { SYNC_ADMIN_KEY } from '@/lib/constants'
import { ServerError, ServerRequest, ServerResponse } from '@/lib/types'
import { syncAccountStatuses } from '@/lib/utils/sync-account-statuses'

export const SyncAccountStatusesSchema = z.object({
  query: z.object({
    admin_key: z.string(),
  }),
})

type Request = z.infer<typeof SyncAccountStatusesSchema>

/**
 * Replica of the running cron job that syncs transactions
 */
export const syncAccountStatusesHandler = async (
  req: ServerRequest<object, object, Request['query']>,
  res: ServerResponse,
) => {
  const { admin_key } = req.query

  if (admin_key !== SYNC_ADMIN_KEY) {
    throw new ServerError(401)
  }

  await syncAccountStatuses()

  res.json({ success: true })
}
