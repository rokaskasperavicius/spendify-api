import { Request, Response } from 'express'
import { Send } from 'express-serve-static-core'

export enum ERROR_CODES {
  UNKNOWN = 'UNKNOWN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_EXISTS = 'USER_EXISTS',
  DUPLICATE_ACCOUNTS = 'DUPLICATE_ACCOUNTS',
  INVALID_SCHEMA = 'INVALID_SCHEMA',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export class ServerError extends Error {
  status: number
  code: ERROR_CODES | undefined

  constructor(status: number, code?: ERROR_CODES, message?: string) {
    super(message)

    this.status = status
    this.code = code
  }
}

export interface ServerRequest<B = object, P = object, Q = object> extends Request<P, ServerResponseBody, B, Q> {
  body: B
}

type ServerResponseBody = { success: boolean; data?: [] | object }
export interface ServerResponse extends Response<ServerResponseBody, { userId: number }> {
  json: Send<ServerResponseBody, this>
}
