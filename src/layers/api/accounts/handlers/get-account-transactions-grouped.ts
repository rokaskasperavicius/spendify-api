import { format } from 'date-fns'
import { StatusCodes } from 'http-status-codes'
import groupBy from 'lodash/groupBy'
import { z } from 'zod'

import { ServerError, ServerRequest, ServerResponse } from '@/global/types'

import prisma from '@/layers/database/db'
import { gocardlessCurrency } from '@/layers/gocardless/utils'

export const GetAccountTransactionsGroupedSchema = z.object({
  params: z.object({
    accountId: z.string(),
  }),
})

type Request = z.infer<typeof GetAccountTransactionsGroupedSchema>

type ReducedGroupedTransactions = {
  date: string
  expenses: string
  income: string
  expensesInt: number
  incomeInt: number
}

export const getAccountTransactionsGrouped = async (
  req: ServerRequest<unknown, Request['params']>,
  res: ServerResponse
) => {
  const { accountId } = req.params

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

  const transactions = await prisma.transactions.findMany({
    where: {
      account_id: accountId,
    },
    orderBy: {
      weight: 'desc',
    },
  })

  const groupedTransactions = groupBy(transactions, (transaction) => format(new Date(transaction.date), 'MMMM, yyyy'))

  const reducedTransactions = Object.keys(groupedTransactions).reduce(
    (acc: Array<ReducedGroupedTransactions>, value) => {
      let expenses = 0
      let income = 0

      groupedTransactions[value]?.forEach((transaction) => {
        const amount = gocardlessCurrency(transaction.amount).value

        if (amount < 0) {
          expenses += amount * -1
        } else {
          income += amount
        }
      })

      acc.push({
        date: value,
        expenses: gocardlessCurrency(expenses).format(),
        expensesInt: expenses,

        income: gocardlessCurrency(income).format(),
        incomeInt: income,
      })

      return acc
    },
    []
  )

  res.json({
    success: true,
    data: reducedTransactions,
  })
}
