import { NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ZodError, ZodSchema } from 'zod'

import { ERROR_CODES, ServerError, ServerRequest, ServerResponse } from '@/lib/types'

export function validateSchema(schema: ZodSchema) {
  return async (req: ServerRequest, _res: ServerResponse, next: NextFunction) => {
    try {
      await schema.parse(req)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ServerError(StatusCodes.BAD_REQUEST, ERROR_CODES.INVALID_SCHEMA, error.message)
      } else {
        throw error
      }
    }
  }
}
