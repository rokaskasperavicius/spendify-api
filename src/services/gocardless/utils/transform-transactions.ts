import { BookedTransaction, FormattedTransaction } from '../types'
import { gocardlessCurrency } from './currency'

const rules = [
  // Food & Groceries
  { pattern: /rema|rema1000/i, category: 'Food & Groceries' },
  { pattern: /fakta/i, category: 'Food & Groceries' },
  { pattern: /kvickly/i, category: 'Food & Groceries' },
  { pattern: /superbrugsen/i, category: 'Food & Groceries' },
  { pattern: /coop/i, category: 'Food & Groceries' },
  { pattern: /irma/i, category: 'Food & Groceries' },
  { pattern: /aldi/i, category: 'Food & Groceries' },
  { pattern: /lidl/i, category: 'Food & Groceries' },
  { pattern: /bilka/i, category: 'Food & Groceries' },
  { pattern: /økomarket/i, category: 'Food & Groceries' },
  { pattern: /netto/i, category: 'Food & Groceries' },
  { pattern: /meny/i, category: 'Food & Groceries' },
  { pattern: /føtex|foetex/i, category: 'Food & Groceries' },
  { pattern: /7-eleven/i, category: 'Food & Groceries' },
  { pattern: /wolt/i, category: 'Food & Groceries' },
  { pattern: /just eat/i, category: 'Food & Groceries' },
  { pattern: /kiosk/i, category: 'Food & Groceries' },
  { pattern: /cafeteria/i, category: 'Food & Groceries' },
  { pattern: /bakery/i, category: 'Food & Groceries' },

  // Transfers
  { pattern: /\boverførsel\b/i, category: 'Transfers' }, // lønoverførsel belongs to Utilities
  { pattern: /mobilepay/i, category: 'Transfers' },

  // Everything else belongs to Utilities
]

export const transformTransactions = (transactions: BookedTransaction[], balance: number): FormattedTransaction[] => {
  // Apply titles
  const titled = transactions.map((transaction) => {
    const title = transaction.remittanceInformationUnstructuredArray
      ? transaction.remittanceInformationUnstructuredArray[0]
      : transaction.remittanceInformationUnstructured

    return {
      ...transaction,
      title: title || '',
    }
  })

  // Apply categories
  const categorized = titled.map((transaction) => {
    const rule = rules.find((rule) => transaction.title.match(rule.pattern))

    return {
      ...transaction,
      category: rule?.category || 'Utilities',
    }
  })

  // Apply balances
  let currentBalance = balance

  const balanced = categorized.map((transaction, index) => {
    const prev = transactions[index - 1]

    // Skip first transaction
    if (index !== 0 && prev) {
      const prevTransactionAmount = gocardlessCurrency(prev.transactionAmount.amount).value

      currentBalance = gocardlessCurrency(currentBalance).subtract(prevTransactionAmount).value
    }

    return {
      ...transaction,
      amount: gocardlessCurrency(transaction.transactionAmount.amount).value,
      totalAmount: currentBalance,
    }
  })

  // Remove unknown dates and transactions
  return balanced.filter(
    (transaction): transaction is FormattedTransaction =>
      Boolean(transaction.valueDate) && Boolean(transaction.transactionId),
  )
}
