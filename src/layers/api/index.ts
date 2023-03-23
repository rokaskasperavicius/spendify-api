import express from 'express'

// Routes
import authRoutes from '@layers/api/auth/auth.routes'
import accountsRoutes from '@layers/api/accounts/accounts.routes'

const app = express()

app.use('/auth', authRoutes)
app.use('/accounts', accountsRoutes)

export default app
