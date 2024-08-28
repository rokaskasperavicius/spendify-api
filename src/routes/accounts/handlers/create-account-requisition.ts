import { z } from 'zod'

import { GOCARDLESS_ACCESS_SCOPE, GOCARDLESS_ACCESS_VALID_FOR_DAYS } from '@/lib/constants'
import { ServerRequest, ServerResponse } from '@/lib/types'

import { createNordigenAgreement, createNordigenRequisition, getInstitutionById } from '@/services/gocardless/api'

export const CreateAccountRequisitionSchema = z.object({
  body: z.object({
    institutionId: z.string(),
    redirect: z.string().url(),
  }),
})

type Request = z.infer<typeof CreateAccountRequisitionSchema>

export const createAccountRequisition = async (req: ServerRequest<Request['body']>, res: ServerResponse) => {
  const { institutionId, redirect } = req.body

  const { data: institution } = await getInstitutionById(institutionId)

  const { data: agreement } = await createNordigenAgreement({
    institution_id: institutionId,
    max_historical_days: Number(institution.transaction_total_days),
    access_scope: GOCARDLESS_ACCESS_SCOPE,
    access_valid_for_days: GOCARDLESS_ACCESS_VALID_FOR_DAYS,
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
