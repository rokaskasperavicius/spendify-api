/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
|
| Here you define all of the routes for the auth endpoint
|
*/

import 'express-async-errors'
import express from 'express'

// Handlers
import { loginUser, registerUser, refreshUserToken } from '@layers/api/auth/auth.handlers'

// Validators
import { validateRegisterUser, validateLoginUser } from '@layers/api/auth/auth.validators'

const app = express.Router()

app.post('/register', validateRegisterUser, registerUser)

app.post('/login', validateLoginUser, loginUser)

app.post('/refresh-token', refreshUserToken)

export default app
