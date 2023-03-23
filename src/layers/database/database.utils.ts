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
} from '@layers/database/database.types'

export const createUser = ({ firstName, lastName, email, password }: CreateUserBody) =>
  db(
    `INSERT INTO
      users(first_name, last_name, email, password)
      VALUES($1, $2, $3, $4)
    `,
    [firstName, lastName, email, password]
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
      id, password, first_name, last_name, refresh_token 
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

export const getUserAccountWithAccountId = ({ userId, accountId }: GetUserAccountWithAccountIdBody) =>
  db<GetUserAccountWithAccountIdResponse>(
    `SELECT
      id, account_id, requisition_id, account_name, account_iban, bank_name, bank_logo
      FROM accounts
      WHERE user_id = $1 AND account_id = $2
    `,
    [userId, accountId]
  )

export const getUserAccounts = ({ userId }: GetUserAccountsBody) =>
  db<GetUserAccountsResponse>(
    `SELECT
      id, account_id, requisition_id, account_name, account_iban, bank_name, bank_logo
      FROM accounts
      WHERE user_id = $1
    `,
    [userId]
  )

export const createUserAccount = ({
  userId,
  requisitionId,
  accountId,
  accountName,
  accountIban,
  bankName,
  bankLogo,
}: CreateUserAccountBody) =>
  db(
    `INSERT INTO
      accounts(user_id, requisition_id, account_id, account_name, account_iban, bank_name, bank_logo)
      VALUES($1, $2, $3, $4, $5, $6, $7)
  `,
    [userId, requisitionId, accountId, accountName, accountIban, bankName, bankLogo]
  )
