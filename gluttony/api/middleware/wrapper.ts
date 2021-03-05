import { NextFunction, Request, Response } from 'express'
import { ApiError } from 'next/dist/next-server/server/api-utils'
import { BaseEntity } from 'typeorm'
import { strip } from '../../database/decorators/Hidden'
import Token from '../../database/models/Token'
import User from '../../database/models/User'
import authenticate from '../middleware/authenticate'

export type RequestHandler<R extends Request = Request> = (req: R, res: Response, next: NextFunction) => unknown
export type ErrorRequestHandler = (error: Error, req: Request, res: Response, next: NextFunction) => unknown

export interface AuthRequest extends Request {
   user: User
   token: Token
}

export function wrap(func: RequestHandler) {
   return (async (req: Request, res: Response, next: NextFunction) => {
      try {
         await authenticate(req, res, (e?: any) => (req.authError = e))
         const response = await func(req, res, next)

         if (response === null || response === undefined) throw new ApiError(404, 'Not found')
         else if (response === true) res.status(200).send()
         else if (response) res.send(response instanceof BaseEntity ? strip(response) : response)
      } catch (e) {
         next(e)
      }
   }) as RequestHandler
}

   export function wrapAuth(func: RequestHandler<AuthRequest>, validate: (user: User) => boolean = () => true) {
   return wrap(async (req: Request, res: Response, next: NextFunction) => {
      if (req.authError) throw req.authError
      if (!req.user || !validate(req.user)) throw new ApiError(403, 'Unauthorized')

      return func(req as AuthRequest, res, next)
   }) as RequestHandler
}
