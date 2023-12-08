import { Pool, QueryResult } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
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
