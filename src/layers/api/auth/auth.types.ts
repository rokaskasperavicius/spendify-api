/*
|--------------------------------------------------------------------------
| Auth Types
|--------------------------------------------------------------------------
|
| Here you define all of the types for the auth endpoint
|
*/

export type RegisterUserBody = {
  firstName: string
  lastName: string
  email: string
  password: string
}

export type LoginUserBody = {
  email: string
  password: string
}
