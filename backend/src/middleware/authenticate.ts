import { NextFunction, Request } from 'express'
import { verify } from 'jsonwebtoken'
import config from '../config'
import BadRequestError from '../error/BadRequestError'
import UnauthorizedError from '../error/UnauthorizedError'
import Session from '../models/Session'

const { jwt } = config.auth

export default async (req: Request, _: unknown, next: NextFunction) => {
   try {
      req.session = await authenticate(req)
      req.user = req.session.user
      next()
   } catch (e) {
      next(e)
   }
}

export interface TokenData {
   user: { id: number }
   token: { id: number }
}

function decodeJWT(token: string, secret: string) {
   try {
      return verify(token, secret) as TokenData
   } catch (e) {
      throw new BadRequestError(e.message)
   }
}

export async function authenticate(req: Request) {
   const [type, access_token] = req.headers.authorization?.split(' ') ?? []

   if (!access_token) throw new UnauthorizedError('You are not logged in')
   if (type !== 'Bearer') throw new BadRequestError('Invalid authorization type')

   const decoded = decodeJWT(access_token, jwt.access_secret)

   const session = await Session.findOne(decoded.token.id)
   if (!session) throw new BadRequestError('Invalid session')

   return session
}
