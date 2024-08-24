/*
|--------------------------------------------------------------------------
| Auth Types
|--------------------------------------------------------------------------
|
| Here you define all of the types for the auth endpoint
|
*/

export type RegisterUserBody = {
  name: string
  email: string
  password: string
}

export type LoginUserBody = {
  email: string
  password: string
}


export type SignOutUserBody = {
  sessionId: string
}

export type PatchUserInfoBody = {
  name: string
  email: string
}

export type PatchUserPasswordBody = {
  oldPassword: string
  newPassword: string
}

export type GetIPLocationSuccessResponse = {
  status: string
  country: string
  city: string
}
