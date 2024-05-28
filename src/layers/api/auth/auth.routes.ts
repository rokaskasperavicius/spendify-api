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
import {
  loginUser,
  registerUser,
  patchUserInfoHandler,
  patchUserPasswordHandler,
  destroySessionHandler,
  getUserSessionsHandler,
  logOutHandler,
} from '@layers/api/auth/auth.handlers'

// Helpers
import { verifyUser } from '@middlewares'

// Validators
import {
  validateRegisterUser,
  validateLoginUser,
  validatePatchUserInfo,
  validatePatchUserPassword,
  validateDestroySession,
} from '@layers/api/auth/auth.validators'

const app = express.Router()

app.post('/register', validateRegisterUser, registerUser)

app.post('/login', validateLoginUser, loginUser)

app.delete('/destroy-session', validateDestroySession, destroySessionHandler)
app.post('/log-out', logOutHandler)

app.get('/sessions', verifyUser, getUserSessionsHandler)

app.patch('/user-info', verifyUser, validatePatchUserInfo, patchUserInfoHandler)
app.patch('/user-password', verifyUser, validatePatchUserPassword, patchUserPasswordHandler)

export default app
