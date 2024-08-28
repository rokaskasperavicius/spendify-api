import express from 'express'

import accountsRoutes from './accounts/routes'
import authRoutes from './auth/routes'

const app = express()

app.use('/auth', authRoutes)
app.use('/accounts', accountsRoutes)

export default app
