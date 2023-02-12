import { Pool } from 'pg'

const pool = new Pool()

export const db = async (query: string, values?: string[]) => {
  const client = await pool.connect()

  try {
    return await client.query(query, values).then((result) => result.rows)
  } finally {
    client.release()
  }
}
