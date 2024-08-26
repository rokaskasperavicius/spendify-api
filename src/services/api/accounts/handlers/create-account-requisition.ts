import { z } from 'zod'

import { NORDIGEN_ACCESS_SCOPE, NORDIGEN_ACCESS_VALID_FOR_DAYS } from '@/lib/constants'
import { ServerRequest, ServerResponse } from '@/lib/types'

import { createNordigenAgreement, createNordigenRequisition } from '@/services/gocardless/api'

export const CreateAccountRequisitionSchema = z.object({
  body: z.object({
    institutionId: z.string(),
    redirect: z.string().url(),
    maxHistoricalDays: z.number(),
  }),
})

type Request = z.infer<typeof CreateAccountRequisitionSchema>

export const createAccountRequisition = async (req: ServerRequest<Request['body']>, res: ServerResponse) => {
  const { institutionId, redirect, maxHistoricalDays } = req.body

  const { data: agreement } = await createNordigenAgreement({
    institution_id: institutionId,
    max_historical_days: maxHistoricalDays,
    access_scope: NORDIGEN_ACCESS_SCOPE,
    access_valid_for_days: NORDIGEN_ACCESS_VALID_FOR_DAYS,
  })

  const { data: requisition } = await createNordigenRequisition({
    redirect,
    institution_id: institutionId,
    agreement: agreement.id,
    account_selection: false,
    redirect_immediate: false,
    user_language: 'da',
  })

  res.json({
    success: true,

    data: {
      url: requisition.link,
    },
  })
}
