// Types
import { ERROR_CODES } from 'types'

export class ServerError extends Error {
  status: number
  code: ERROR_CODES | undefined

  constructor(status: number, code?: ERROR_CODES, message?: string) {
    super(message)

    this.status = status
    this.code = code
  }
}
