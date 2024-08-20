// Helpers
import { ERROR_CODES, ServerError } from '@global/types'
// Types
import {
  CreateUserAccountBody,
  CreateUserBody,
  DeleteUserAccountBody,
  DeleteUserRefreshTokenBody,
  GetAllUserTokensBody,
  GetAllUserTokensResponse,
  GetUserAccountWithAccountIdBody,
  GetUserAccountWithAccountIdResponse,
  GetUserAccountsBody,
  GetUserAccountsResponse,
  GetUserWithEmailBody,
  GetUserWithEmailResponse,
  GetUserWithIdBody,
  GetUserWithIdResponse,
  GetUserWithRefreshTokenBody,
  GetUserWithRefreshTokenResponse,
  PatchUserInfoBody,
  PatchUserPasswordBody,
  SetUserRefreshTokenBody,
  UpdateUserRefreshTokenBody,
} from '@layers/database/database.types'
import { db } from '@layers/database/db'

export const createUser = ({ name, email, password }: CreateUserBody) =>
  db(
    `INSERT INTO
      users(name, email, password)
      VALUES($1, $2, $3)
    `,
    [name, email, password]
  )

export const getUserWithEmail = ({ email }: GetUserWithEmailBody) =>
  db<GetUserWithEmailResponse>(
    `SELECT
      id, password, name 
      FROM users
      WHERE email = $1
    `,
    [email]
  )

export const getUserWithRefreshToken = ({ refreshToken }: GetUserWithRefreshTokenBody) =>
  db<GetUserWithRefreshTokenResponse>(
    `SELECT
      user_id
      FROM tokens
      WHERE refresh_token = $1
    `,
    [refreshToken]
  )

export const getUserWithId = ({ id }: GetUserWithIdBody) =>
  db<GetUserWithIdResponse>(
    `SELECT
      id, name, email, password
      FROM users
      WHERE id = $1
    `,
    [id]
  )

export const patchUserInfo = ({ userId, name, email }: PatchUserInfoBody) =>
  db(
    `UPDATE users
      SET name = $1, email = $2
      WHERE id = $3
    `,
    [name, email, userId]
  )

export const patchUserPassword = ({ userId, password }: PatchUserPasswordBody) =>
  db(
    `UPDATE users
      SET password = $1
      WHERE id = $2
    `,
    [password, userId]
  )

export const getUserAccountWithAccountId = ({ userId, accountId }: GetUserAccountWithAccountIdBody) =>
  db<GetUserAccountWithAccountIdResponse>(
    `SELECT
      account_id, account_name, account_iban, bank_name, bank_logo
      FROM accounts
      WHERE user_id = $1 AND account_id = $2
    `,
    [userId, accountId]
  )

export const getUserAccounts = ({ userId }: GetUserAccountsBody) =>
  db<GetUserAccountsResponse>(
    `SELECT
      account_id, account_name, account_iban, bank_name, bank_logo
      FROM accounts
      WHERE user_id = $1
    `,
    [userId]
  )

export const deleteUserAccount = ({ userId, accountId }: DeleteUserAccountBody) =>
  db(
    `DELETE
      FROM accounts
      WHERE user_id = $1 AND account_id = $2
    `,
    [userId, accountId]
  )

const isDatabaseError = (error: unknown): error is { code: string } => {
  return typeof error === 'object' && error !== null && 'code' in error
}

export const createUserAccount = async ({
  userId,
  accountId,
  accountName,
  accountIban,
  bankName,
  bankLogo,
}: CreateUserAccountBody) => {
  try {
    return await db(
      `INSERT INTO
        accounts(user_id, account_id, account_name, account_iban, bank_name, bank_logo)
        VALUES($1, $2, $3, $4, $5, $6)
    `,
      [userId, accountId, accountName, accountIban, bankName, bankLogo]
    )
  } catch (error) {
    if (isDatabaseError(error) && error.code === '23505') {
      throw new ServerError(400, ERROR_CODES.DUPLICATE_ACCOUNTS)
    }

    throw error
  }
}
