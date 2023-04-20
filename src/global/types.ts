// Types
import { Request, Response } from 'express'
import { Send } from 'express-serve-static-core'

export enum ERROR_CODES {
  UNKNOWN = -1,
  INVALID_CREDENTIALS = 1,
  DUPLICATE_ACCOUNTS = 2,
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
