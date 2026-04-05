import 'dotenv/config'
import { setupServer } from 'msw/node'

import { MOCKS_ENABLED, NODE_ENV } from '@/lib/constants'
import { scheduleJobs } from '@/lib/jobs'

import { handlers } from '@/mocks/handlers'

import app from './app'

// MSW setup
const server = setupServer(...handlers)

// TODO: Don't need NODE_ENV and evaluate the need for mocks
if (NODE_ENV === 'development' && MOCKS_ENABLED === 'true') {
  server.listen({
    // This is going to perform unhandled requests
    // but print no warning whatsoever when they happen.
    onUnhandledRequest: 'bypass',
  })
}

const port = process.env.PORT || 8080

scheduleJobs()

app.listen(port, () => {
  console.log(`⚡️ [SERVER]: Server is running at http://localhost:${port}`)
})
