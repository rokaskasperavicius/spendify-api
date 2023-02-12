import express from 'express'
import 'dotenv/config'

// Features
import nordigenRouter from '@features/nordigen/routes'

// Setup
const app = express()
const port = process.env.PORT || 8080

app.get('/', async (req, res) => {
  res.send('Express + TypeScript Server')
})

app.use('/api/nordigen', nordigenRouter)

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`)
})
