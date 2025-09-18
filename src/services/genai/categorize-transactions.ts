import { z } from 'zod'

import { TRANSACTION_CATEGORIES_AI } from '@/lib/constants'

import { GenAiType, genAi } from './api-service'

const Schema = z.array(
  z.object({
    transaction: z.string(),
    category: z.enum([...TRANSACTION_CATEGORIES_AI] as [string, ...string[]]),
  }),
)

export const categorizeTransactions = async <T extends { title: string }>(
  transactions: Array<T>,
): Promise<(T & { category_ai: string })[]> => {
  const prompt = `
    I need you to categorize a list of transactions below.
    Keep the order of categorized transactions the same as in the list.
    Some unique cases of transactions for an example:
      [{
        transaction: "APOTEKET SUNDBY, KOBENHAVN S Notanr 34321"
        category: "Utilities"
      }]

    The list:
      ${transactions.map((tx) => `- "${tx.title}"`).join('\n')}
  `

  const response = await genAi.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: GenAiType.ARRAY,
        items: {
          type: GenAiType.OBJECT,
          properties: {
            transaction: {
              type: GenAiType.STRING,
            },
            category: {
              type: GenAiType.STRING,
              enum: TRANSACTION_CATEGORIES_AI,
            },
          },
          propertyOrdering: ['transaction', 'category'],
        },
      },
      thinkingConfig: {
        thinkingBudget: 0, // Disables thinking
      },
    },
  })

  if (!response?.text) {
    throw new Error('No response from GenAI')
  }

  const parsed = JSON.parse(response.text)
  const verified = Schema.safeParse(parsed)

  if (verified.error) {
    throw new Error(`Failed to parse response: ${verified.error.message}`)
  }

  return transactions.map((transaction) => {
    const match = verified.data.find((item) => item.transaction === transaction.title)

    if (!match) {
      throw new Error(`No category found for transaction: ${transaction.title}`)
    }

    return { ...transaction, category_ai: match?.category || 'Other' }
  })
}
