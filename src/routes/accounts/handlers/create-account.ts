import { z } from 'zod'

import { ServerRequest, ServerResponse } from '@/lib/types'

import {
  getAccountBalanceById,
  getAccountDetailsById,
  getAccountMetadata,
  getAccountTransactionsById,
  getInstitutionById,
} from '@/services/gocardless/api'
import { gocardlessCurrency } from '@/services/gocardless/utils/currency'
import { transformTransactions } from '@/services/gocardless/utils/transform-transactions'
import prisma from '@/services/prisma'

export const CreateAccountSchema = z.object({
  body: z.object({
    accountId: z.string(),
  }),
})

type Request = z.infer<typeof CreateAccountSchema>

export const createAccount = async (req: ServerRequest<Request['body']>, res: ServerResponse) => {
  const { accountId } = req.body
  const { userId } = res.locals

  const {
    data: { account: details },
  } = await getAccountDetailsById(accountId)
  const {
    data: { balances },
  } = await getAccountBalanceById(accountId)
  const { data: metadata } = await getAccountMetadata(accountId)
  const { data: institution } = await getInstitutionById(String(metadata.institution_id))

  const totalBalance = gocardlessCurrency(balances && balances[0]?.balanceAmount.amount).value

  const dataToInsert = {
    name: details.name,
    iban: details.iban,
    balance: totalBalance,
    institution_name: institution.name,
    institution_logo: institution.logo,
    last_synced: new Date(),
  }

  // TODO: Does not allow multiple users in one account
  await prisma.accounts.upsert({
    where: {
      id: accountId,
    },
    update: {
      ...dataToInsert,
    },
    create: {
      id: accountId,
      ...dataToInsert,

      users: {
        connect: {
          id: userId,
        },
      },
    },
  })

  // Here we sync transactions
  const { data } = await getAccountTransactionsById(accountId)

  // Reversing is important because we want to insert the oldest transactions first
  // This way the database will have autoincremented ids that we can use as the sorting weight
  const transformed = transformTransactions(data.transactions.booked, totalBalance).reverse()

  const result = await prisma.transactions.createMany({
    data: transformed.map((transaction) => ({
      id: transaction.transactionId,
      account_id: accountId,
      title: transaction.title,
      category: transaction.category,
      amount: transaction.amount,
      total_amount: transaction.totalAmount,
      date: new Date(transaction.valueDate),
    })),
    skipDuplicates: true,
  })

  console.info(`[INFO] Inserted ${result.count} transactions for account ${accountId}`)

  res.json({
    success: true,
  })
}
