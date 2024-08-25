import { z } from 'zod'

import { ServerRequest, ServerResponse } from '@/global/types'

import prisma from '@/layers/database/db'
import {
  getAccountBalanceById,
  getAccountDetailsById,
  getAccountMetadata,
  getAccountTransactionsById,
  getInstitutionById,
} from '@/layers/gocardless/api'
import { gocardlessCurrency } from '@/layers/gocardless/utils'

import { transform } from '../transactions/transform'

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

  // Here we should sync transactions
  const { data } = await getAccountTransactionsById(accountId)
  const currentBalance = totalBalance

  const transformed = transform(data.transactions.booked, currentBalance).reverse()

  const result = await prisma.transactions.createMany({
    data: transformed.map((transaction) => ({
      account_id: accountId,
      transaction_id: transaction.transactionId,
      title: transaction.title,
      category: transaction.category,
      amount: transaction.amount,
      total_amount: transaction.totalAmount,
      date: new Date(transaction.valueDate),
    })),
    skipDuplicates: true,
  })

  console.log(`[INFO] Inserted ${result.count} transactions for account ${accountId}`)

  res.json({
    success: true,
  })
}
