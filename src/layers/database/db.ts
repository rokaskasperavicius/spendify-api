import { Pool, QueryResult } from 'pg'
import { PrismaClient } from '@prisma/client'
import { DATABASE_URL, NODE_ENV } from '@global/constants'

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

interface ServerQueryResult<T> extends QueryResult {
  rows: T[]
}

export const db = async <T>(query: string, values?: Array<string | number>) => {
  const client = await pool.connect()

  try {
    const results = await client.query<ServerQueryResult<T>>(query, values)

    return results.rows as T[]
  } finally {
    client.release()
  }
}

const prisma = new PrismaClient()

export default prisma
