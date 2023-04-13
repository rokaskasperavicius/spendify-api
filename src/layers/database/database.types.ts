export type CreateUserBody = {
  name: string
  email: string
  password: string
}

export type UpdateUserRefreshTokenBody = {
  userId: number
  refreshToken: string
}

export type GetUserWithEmailBody = {
  email: string
}

export type GetUserWithEmailResponse = {
  id: number
  password: string
  name: string
  refresh_token: string
}

export type GetUserWithRefreshTokenBody = {
  refreshToken: string
}

export type GetUserWithRefreshTokenResponse = {
  id: number
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
  id: number
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
