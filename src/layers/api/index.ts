import express from 'express'

import accountsRoutes from '@/layers/api/accounts/accounts.routes'
import authRoutes from '@/layers/api/auth/auth.routes'

const app = express()

app.use('/auth', authRoutes)
app.use('/accounts', accountsRoutes)

export default app
