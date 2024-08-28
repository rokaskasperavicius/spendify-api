import { z } from 'zod'

import { ServerRequest, ServerResponse } from '@/lib/types'

import {
  getAccountBalanceById,
  getAccountDetailsById,
  getAccountMetadata,
  getInstitutionById,
  getRequisitionById,
} from '@/services/gocardless/api'
import { gocardlessCurrency } from '@/services/gocardless/utils/currency'

export const GetAvailableAccountsSchema = z.object({
  params: z.object({
    requisitionId: z.string(),
  }),
})

type Request = z.infer<typeof GetAvailableAccountsSchema>

export const getAvailableAccounts = async (req: ServerRequest<object, Request['params']>, res: ServerResponse) => {
  const { requisitionId } = req.params
  const { data } = await getRequisitionById(requisitionId)

  if (!data.accounts || data.accounts?.length === 0) {
    res.json({
      success: true,
      data: [],
    })

    return
  }

  const accounts = data.accounts.map(async (accountId) => {
    const { data: metadata } = await getAccountMetadata(accountId)
    const { data: institution } = await getInstitutionById(String(metadata.institution_id))

    const {
      data: { account },
    } = await getAccountDetailsById(accountId)
    const {
      data: { balances },
    } = await getAccountBalanceById(accountId)

    return {
      accountId,
      accountName: account.name,
      accountIban: account.iban,
      accountBalance: gocardlessCurrency(balances && balances[0]?.balanceAmount.amount).format(),
      institutionLogo: institution.logo,
    }
  })

  const resolved = await Promise.all(accounts)

  res.json({
    success: true,
    data: resolved,
  })
}
