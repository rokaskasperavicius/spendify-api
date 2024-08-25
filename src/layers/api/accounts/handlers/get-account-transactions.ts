import { endOfDay, startOfDay } from 'date-fns'
import fuzzysort from 'fuzzysort'
import { StatusCodes } from 'http-status-codes'
import { z } from 'zod'

import { ServerError, ServerRequest, ServerResponse } from '@/global/types'

import prisma from '@/layers/database/db'

export const GetAccountTransactionsSchema = z.object({
  params: z.object({
    accountId: z.string(),
  }),

  query: z.object({
    search: z.string().optional(),
    category: z.enum(['Food & Groceries', 'Utilities', 'Transfers']).optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  }),
})

type Request = z.infer<typeof GetAccountTransactionsSchema>

export const getAccountTransactions = async (
  req: ServerRequest<object, Request['params'], Request['query']>,
  res: ServerResponse
) => {
  const { accountId } = req.params
  const { search, category, from, to } = req.query

  const account = await prisma.accounts.findFirst({
    where: {
      id: accountId,
      AND: {
        users: {
          some: {
            id: res.locals.userId,
          },
        },
      },
    },
  })

  if (!account) {
    throw new ServerError(StatusCodes.BAD_REQUEST)
  }

  let transactions = await prisma.transactions.findMany({
    where: {
      account_id: accountId,
    },
    orderBy: {
      weight: 'desc',
    },
  })

  // Apply fuzzysort
  transactions = search
    ? fuzzysort.go(search, transactions, { key: 'title', threshold: -400 }).map((search) => search.obj)
    : transactions

  transactions = transactions.filter((transaction) => {
    if (!from || !to) return true

    const transactionDate = transaction.date.getTime()
    const fromDate = startOfDay(new Date(parseInt(from))).getTime()
    const endDate = endOfDay(new Date(parseInt(to))).getTime()

    return transactionDate >= fromDate && transactionDate <= endDate
  })

  transactions = transactions.filter((transaction) => !category || transaction.category === category)

  res.json({
    success: true,
    data: transactions,
  })
}
