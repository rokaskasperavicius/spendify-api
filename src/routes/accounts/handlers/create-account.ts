import { z } from 'zod'

import { ERROR_CODES, ServerError, ServerRequest, ServerResponse } from '@/lib/types'

import {
  getAccountBalanceById,
  getAccountDetailsById,
  getAccountMetadata,
  getAccountTransactionsById,
  getInstitutionById,
  getRequisitionById,
} from '@/services/gocardless/api'
import { gocardlessCurrency } from '@/services/gocardless/utils/currency'
import { transformTransactions } from '@/services/gocardless/utils/transform-transactions'
import prisma from '@/services/prisma'

export const CreateAccountSchema = z.object({
  body: z.object({
    accountId: z.string(),
    requisitionId: z.string(),
  }),
})

type Request = z.infer<typeof CreateAccountSchema>

export const createAccount = async (req: ServerRequest<Request['body']>, res: ServerResponse) => {
  const { accountId, requisitionId } = req.body
  const { userId } = res.locals

  // Check that accountId belongs to the requisitionId
  const { data: accounts } = await getRequisitionById(requisitionId)
  const belongsToRequisition = accounts.accounts?.some((account) => account === accountId)

  if (!belongsToRequisition) {
    throw new ServerError(400, ERROR_CODES.WRONG_ACCOUNT)
  }

  const { data: metadata } = await getAccountMetadata(accountId)
  const {
    data: { account: details },
  } = await getAccountDetailsById(accountId)
  const {
    data: { balances },
  } = await getAccountBalanceById(accountId)
  const { data: institution } = await getInstitutionById(String(metadata.institution_id))

  const totalBalance = gocardlessCurrency(balances && balances[0]?.balanceAmount.amount).value

  const institutionData = {
    id: institution.id,
    name: institution.name,
    logo: institution.logo,
  }

  await prisma.accounts
    .create({
      data: {
        id: accountId,
        name: details.name,
        iban: details.iban,
        status: metadata.status,
        balance: totalBalance,
        requisitionId: requisitionId,
        last_synced: new Date(),

        users: {
          connect: {
            id: userId,
          },
        },

        institutions: {
          connectOrCreate: {
            where: {
              id: institutionData.id,
            },
            create: institutionData,
          },
        },
      },
    })
    .catch((error) => {
      if (error?.code === 'P2002') {
        throw new ServerError(400, ERROR_CODES.DUPLICATE_ACCOUNTS)
      }

      throw error
    })

  // Here we sync transactions
  const { data } = await getAccountTransactionsById(accountId)

  // Reversing is important because we want to insert the oldest transactions first
  // This way the database will have autoincremented IDs that we can use as the sorting weight
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
