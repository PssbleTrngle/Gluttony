import { NextFunction, Request, Response } from 'express'
import { BaseEntity } from 'typeorm'
import { stripHidden } from '../decorators/Hidden'
import NotFoundError from '../error/NotFoundError'
import UnauthorizedError from '../error/UnauthorizedError'
import authenticate from '../middleware/authenticate'
import Token from '../models/Token'
import User, { UserRole } from '../models/User'

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

         if (response === null || response === undefined) throw new NotFoundError()
         else if (response === true) res.status(200).send()
         else if (response) res.send(response instanceof BaseEntity ? stripHidden(response) : response)
      } catch (e) {
         next(e)
      }
   }) as RequestHandler
}

export function wrapAuth(func: RequestHandler<AuthRequest>, validate: (user: User) => boolean = u => u.role === UserRole.ADMIN) {
   return wrap(async (req: Request, res: Response, next: NextFunction) => {
      if (req.authError) throw req.authError
      if (!req.user || !validate(req.user)) throw new UnauthorizedError()

      return func(req as AuthRequest, res, next)
   }) as RequestHandler
}
