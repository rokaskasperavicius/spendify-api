import { NextFunction } from 'express'
import { ZodSchema } from 'zod'

import { ServerRequest, ServerResponse } from '@/global/types'

export function validateSchema(schema: ZodSchema) {
  return (req: ServerRequest, _res: ServerResponse, next: NextFunction) => {
    schema.parse(req)

    next()
  }
}
