// Helpers
import { db } from '@layers/database/db'

// Types
import {
  CreateUserBody,
  UpdateUserRefreshTokenBody,
  GetUserWithEmailBody,
  GetUserWithEmailResponse,
  GetUserWithRefreshTokenBody,
  GetUserWithRefreshTokenResponse,
  GetUserAccountWithAccountIdBody,
  GetUserAccountWithAccountIdResponse,
  GetUserAccountsBody,
  GetUserAccountsResponse,
  CreateUserAccountBody,
  GetUserWithIdBody,
  GetUserWithIdResponse,
  PatchUserInfoBody,
  PatchUserPasswordBody,
  DeleteUserAccountBody,
} from '@layers/database/database.types'

export const createUser = ({ name, email, password }: CreateUserBody) =>
  db(
    `INSERT INTO
      users(name, email, password)
      VALUES($1, $2, $3)
    `,
    [name, email, password]
  )

export const updateUserRefreshToken = ({ userId, refreshToken }: UpdateUserRefreshTokenBody) =>
  db(
    `UPDATE users
      SET refresh_token = $2
      WHERE id = $1
    `,
    [userId, refreshToken]
  )

export const getUserWithEmail = ({ email }: GetUserWithEmailBody) =>
  db<GetUserWithEmailResponse>(
    `SELECT
      id, password, name, refresh_token 
      FROM users
      WHERE email = $1
    `,
    [email]
  )

export const getUserWithRefreshToken = ({ refreshToken }: GetUserWithRefreshTokenBody) =>
  db<GetUserWithRefreshTokenResponse>(
    `SELECT
      id
      FROM users
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
      account_id, requisition_id, account_name, account_iban, bank_name, bank_logo
      FROM accounts
      WHERE user_id = $1 AND account_id = $2
    `,
    [userId, accountId]
  )

export const getUserAccounts = ({ userId }: GetUserAccountsBody) =>
  db<GetUserAccountsResponse>(
    `SELECT
      account_id, requisition_id, account_name, account_iban, bank_name, bank_logo
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

export const createUserAccount = async ({
  userId,
  requisitionId,
  accountId,
  accountName,
  accountIban,
  bankName,
  bankLogo,
}: CreateUserAccountBody) => {
  try {
    return await db(
      `INSERT INTO
        accounts(user_id, requisition_id, account_id, account_name, account_iban, bank_name, bank_logo)
        VALUES($1, $2, $3, $4, $5, $6, $7)
    `,
      [userId, requisitionId, accountId, accountName, accountIban, bankName, bankLogo]
    )
  } catch (error) {
    // if (error instanceof Error && error.code ) {
    // }
    console.log(typeof error)

    throw error
  }
}
