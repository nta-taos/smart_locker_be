import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { Request, Response, NextFunction } from 'express'

import { ApiError } from '../responses'

export function validationMiddleware<T extends object>(
  type: new () => T,
  source: 'body' | 'query' | 'params' = 'body'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(type, req[source], {
      enableImplicitConversion: true
    })

    const errors = await validate(dto, { whitelist: true })
    if (errors.length > 0) {
      const formattedErrors = errors.reduce(
        (acc, err) => {
          acc[err.property] = Object.values(err.constraints || {})
          return acc
        },
        {} as Record<string, string[]>
      )
      return next(ApiError.badRequest('Validation Error').withErrors(formattedErrors))
    }

    next()
  }
}
