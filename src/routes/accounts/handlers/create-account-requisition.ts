import jwt from 'jsonwebtoken'
import { z } from 'zod'

import { GOCARDLESS_ACCESS_SCOPE, JWT_SECRET } from '@/lib/constants'
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
  const { userId } = res.locals

  const { data: institution } = await getInstitutionById(institutionId)

  const { data: agreement } = await createNordigenAgreement({
    institution_id: institutionId,
    max_historical_days: Number(institution.transaction_total_days),
    access_scope: GOCARDLESS_ACCESS_SCOPE,
    access_valid_for_days: Number(institution.max_access_valid_for_days),
    reconfirmation: false,
  })

  const secret = jwt.sign(
    {
      userId: userId,
    },
    JWT_SECRET,
    { expiresIn: 60 * 15 }, // 15 minutes
  )

  const redirectWithSecret = new URL(redirect)
  redirectWithSecret.searchParams.append('secret', secret)

  const { data: requisition } = await createNordigenRequisition({
    redirect: redirectWithSecret.toString(),
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
