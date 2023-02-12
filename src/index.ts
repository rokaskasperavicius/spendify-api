import express from 'express'
import 'dotenv/config'

// import { Pool } from 'pg'

// const pool = new Pool()

const app = express()
const port = process.env.PORT || 8080

app.get('/', async (req, res) => {
  // const client = await pool.connect()
  // try {
  //   const data = await client
  //     .query('SELECT * FROM test')
  //     .then((results) => results.rows)
  //   res.send('Express + TypeScript Server' + ' id = ' + data[0].id)
  // } catch (error) {
  //   console.error(error)
  // }
  res.send('Express + TypeScript Server')
})

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
})
