/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
|
| Here you define all of the routes for the auth endpoint
|
*/
import express from 'express'

import { validateSchema, verifyUser } from '@/middlewares'

import { DestroySessionSchema, destroySession } from './handlers/destroy-session'
import { getUserSessions } from './handlers/get-user-sessions'
import { logOut } from './handlers/log-out'
import { LoginUserSchema, loginUser } from './handlers/login-user'
import { PatchUserInfoSchema, patchUserInfo } from './handlers/patch-user-info'
import { PatchUserPasswordSchema, patchUserPassword } from './handlers/patch-user-password'
import { RegisterUserSchema, registerUser } from './handlers/register-user'

const app = express.Router()

app.post('/register', validateSchema(RegisterUserSchema), registerUser)
app.post('/login', validateSchema(LoginUserSchema), loginUser)
app.delete('/destroy-session', validateSchema(DestroySessionSchema), destroySession)
app.post('/log-out', logOut)
app.get('/sessions', verifyUser, getUserSessions)
app.patch('/user-info', verifyUser, validateSchema(PatchUserInfoSchema), patchUserInfo)
app.patch('/user-password', verifyUser, validateSchema(PatchUserPasswordSchema), patchUserPassword)

export default app
