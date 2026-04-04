import { Response } from 'express'
import { StatusCodes } from 'http-status-codes'

export class ApiError extends Error {
  public statusCode: number
  public errors?: unknown

  constructor(statusCode: number, message: string, errors?: unknown) {
    super(message)

    this.name = 'ApiError'
    this.statusCode = statusCode
    this.errors = errors

    Error.captureStackTrace(this, this.constructor)
  }

  withErrors(errors: unknown) {
    this.errors = errors
    return this
  }

  send(res: Response) {
    return res.status(this.statusCode).json({
      status: 'error',
      message: this.message,
      errors: this.errors
    })
  }

  static badRequest(message: string) {
    return new ApiError(StatusCodes.BAD_REQUEST, message)
  }

  static unauthorized(message: string) {
    return new ApiError(StatusCodes.UNAUTHORIZED, message)
  }

  static notFound(message: string) {
    return new ApiError(StatusCodes.NOT_FOUND, message)
  }

  static conflict(message: string) {
    return new ApiError(StatusCodes.CONFLICT, message)
  }

  static internal(message: string) {
    return new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, message)
  }
}
