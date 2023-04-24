export type CreateUserBody = {
  name: string
  email: string
  password: string
}

export type UpdateUserRefreshTokenBody = {
  oldRefreshToken: string
  newRefreshToken: string
}

export type DeleteUserRefreshTokenBody = {
  refreshToken: string
}

export type GetAllUserTokensBody = {
  userId: number
}

export type GetAllUserTokensResponse = {
  refresh_token: string
  ip_address: string
  ip_location: string
}

export type SetUserRefreshTokenBody = {
  userId: number
  refreshToken: string
  ipAddress: string
  ipLocation: string
}

export type GetUserWithEmailBody = {
  email: string
}

export type GetUserWithEmailResponse = {
  id: number
  password: string
  name: string
}

export type GetUserWithRefreshTokenBody = {
  refreshToken: string
}

export type GetUserWithRefreshTokenResponse = {
  user_id: number
}

export type GetUserWithIdBody = {
  id: number
}

export type GetUserWithIdResponse = {
  id: number
  name: string
  email: string
  password: string
}

export type GetUserAccountWithAccountIdBody = {
  userId: number
  accountId: string
}

export type GetUserAccountWithAccountIdResponse = {
  account_id: string
  requisition_id: string
  account_name: string
  account_iban: string
  bank_name: string
  bank_logo: string
}

export type GetUserAccountsBody = {
  userId: number
}

export type GetUserAccountsResponse = GetUserAccountWithAccountIdResponse

export type DeleteUserAccountBody = {
  userId: number
  accountId: string
}

export type CreateUserAccountBody = {
  userId: number
  requisitionId: string
  accountId: string
  accountName: string
  accountIban: string
  bankName: string
  bankLogo: string
}

export type PatchUserInfoBody = {
  userId: number
  name: string
  email: string
}

export type PatchUserPasswordBody = {
  userId: number
  password: string
}
