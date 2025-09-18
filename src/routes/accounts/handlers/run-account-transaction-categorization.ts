import { z } from 'zod'

import { SYNC_ADMIN_KEY } from '@/lib/constants'
import { ServerError, ServerRequest, ServerResponse } from '@/lib/types'
import { updateCategorizedTransactions } from '@/lib/utils/update-categorized-transactions'

import { genAiServices } from '@/services/genai'
import { prismaService } from '@/services/prisma'

export const RunAccountTransactionCategorizationSchema = z.object({
  query: z.object({
    admin_key: z.string(),
  }),
})

type Request = z.infer<typeof RunAccountTransactionCategorizationSchema>

/**
 * Replica of the running cron job that syncs transactions
 */
export const runAccountTransactionCategorization = async (
  req: ServerRequest<object, object, Request['query']>,
  res: ServerResponse,
) => {
  const { admin_key } = req.query

  if (admin_key !== SYNC_ADMIN_KEY) {
    throw new ServerError(401)
  }

  await updateCategorizedTransactions(prismaService, genAiServices)

  res.json({ success: true })
}
