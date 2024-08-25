/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
|
| Here you define all of the routes for the auth endpoint
|
*/
import express from 'express'
import 'express-async-errors'

import {
  destroySessionHandler,
  getUserSessionsHandler,
  logOutHandler,
  loginUser,
  patchUserInfoHandler,
  patchUserPasswordHandler,
  registerUser,
} from '@/layers/api/auth/auth.handlers'
import {
  validateDestroySession,
  validateLoginUser,
  validatePatchUserInfo,
  validatePatchUserPassword,
  validateRegisterUser,
} from '@/layers/api/auth/auth.validators'

import { verifyUser } from '@/middlewares'

const app = express.Router()

app.post('/register', validateRegisterUser, registerUser)

app.post('/login', validateLoginUser, loginUser)

app.delete('/destroy-session', validateDestroySession, destroySessionHandler)
app.post('/log-out', logOutHandler)

app.get('/sessions', verifyUser, getUserSessionsHandler)

app.patch('/user-info', verifyUser, validatePatchUserInfo, patchUserInfoHandler)
app.patch('/user-password', verifyUser, validatePatchUserPassword, patchUserPasswordHandler)

export default app
