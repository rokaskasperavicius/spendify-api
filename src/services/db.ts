import { Pool } from 'pg'

const pool = new Pool()

export const db = async (query: string, values?: Array<string | undefined>) => {
  const client = await pool.connect()

  try {
    return await client.query(query, values).then((result) => result.rows)
  } catch (err) {
    if (err instanceof Error) {
      // err.status = 404
    }

    throw err
  } finally {
    client.release()
  }
}
