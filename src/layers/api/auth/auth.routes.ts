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
  refreshUserToken,
  patchUserInfoHandler,
  patchUserPasswordHandler,
  signOutUserHandler,
  getUserDevicesHandler,
} from '@layers/api/auth/auth.handlers'

// Helpers
import { verifyUser } from '@middlewares'

// Validators
import {
  validateRegisterUser,
  validateLoginUser,
  validatePatchUserInfo,
  validatePatchUserPassword,
  validateSignOutUser,
} from '@layers/api/auth/auth.validators'

const app = express.Router()

app.post('/register', validateRegisterUser, registerUser)

app.post('/login', validateLoginUser, loginUser)

app.post('/refresh-token', refreshUserToken)

app.get('/devices', verifyUser, getUserDevicesHandler)

app.delete('/sign-out', verifyUser, validateSignOutUser, signOutUserHandler)

app.patch('/user-info', verifyUser, validatePatchUserInfo, patchUserInfoHandler)
app.patch('/user-password', verifyUser, validatePatchUserPassword, patchUserPasswordHandler)

export default app
