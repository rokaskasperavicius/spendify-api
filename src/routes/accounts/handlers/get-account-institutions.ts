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

  const searchResults = query
    ? fuzzysort.go(query, institutions, { key: 'name' }).map((search) => search.obj)
    : institutions

  // Append Sandbox Institution
  searchResults.push({
    id: GOCARDLESS_SANDBOX_INSTITUTION_ID,
    name: 'Sandbox Finance',
    bic: 'SFIN0000',
    transaction_total_days: '90',
    countries: ['DK'],
    logo: 'https://cdn-logos.gocardless.com/ais/SANDBOXFINANCE_SFIN0000.png',
  })

  res.json({
    success: true,

    data: searchResults.map(({ id, name, logo }) => ({
      id: id,
      name: name,
      logo: logo,
    })),
  })
}
