import type { Request, Response, NextFunction } from 'express'
import { StatusCodes, getReasonPhrase } from 'http-status-codes'

import { ApiError } from '@/common/responses/api-error'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: ApiError | Error, req: Request, res: Response, next: NextFunction): void => {
  const isApiError = err instanceof ApiError
  const statusCode = isApiError ? err.statusCode : StatusCodes.INTERNAL_SERVER_ERROR
  const message = isApiError ? err.message : getReasonPhrase(statusCode)

  const responseError: {
    status: string
    statusCode: number
    message: string
    errors?: unknown
    stack?: string
  } = {
    status: 'error',
    statusCode,
    message
  }

  if (isApiError && err.errors) {
    responseError.errors = err.errors
  }

  if (process.env.NODE_ENV === 'development') {
    responseError.stack = err.stack
  }

  console.error(`[Error] ${statusCode} - ${message}`, {
    path: req.path,
    method: req.method,
    stack: err.stack
  })

  res.status(statusCode).json(responseError)
}
