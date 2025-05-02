import fuzzysort from 'fuzzysort'
import { z } from 'zod'

import { GOCARDLESS_SANDBOX_INSTITUTION_ID } from '@/lib/constants'
import { ServerRequest, ServerResponse } from '@/lib/types'

import { getInstitutions } from '@/services/gocardless/api'

export const GetAccountInstitutionsSchema = z.object({
  query: z.object({
    query: z.string().optional(),
  }),
})

type Request = z.infer<typeof GetAccountInstitutionsSchema>

export const getAccountInstitutions = async (
  req: ServerRequest<object, object, Request['query']>,
  res: ServerResponse,
) => {
  const { data: institutions } = await getInstitutions()
  const { query } = req.query

  // Append Sandbox Institution
  const results = [
    ...institutions,
    {
      id: GOCARDLESS_SANDBOX_INSTITUTION_ID,
      name: 'Sandbox Finance',
      bic: 'SFIN0000',
      transaction_total_days: '90',
      countries: ['DK'],
      logo: 'https://cdn-logos.gocardless.com/ais/SANDBOXFINANCE_SFIN0000.png',
    },
  ]

  const searchResults = query ? fuzzysort.go(query, results, { key: 'name' }).map((search) => search.obj) : results

  res.json({
    success: true,

    data: searchResults.map(({ id, name, logo }) => ({
      id: id,
      name: name,
      logo: logo,
    })),
  })
}
