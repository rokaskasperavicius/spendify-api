import { categorizeTransactions } from './categorize-transactions'

interface IGenAiServices {
  categorizeTransactions: <T extends { title: string }>(
    transactions: Array<T>,
  ) => Promise<(T & { category_ai: string })[]>
}

const genAiServices: IGenAiServices = {
  categorizeTransactions: categorizeTransactions,
}

export { genAiServices, IGenAiServices }
