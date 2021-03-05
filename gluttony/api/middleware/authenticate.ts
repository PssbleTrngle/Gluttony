import { NextFunction, Request } from 'express'
import { verify } from 'jsonwebtoken'
import { ApiError } from 'next/dist/next-server/server/api-utils'
import config from '../../config'
import Token from '../../database/models/Token'

const { jwt } = config.auth

export default async (req: Request, _: unknown, next: NextFunction) => {
   try {
      req.token = await authenticate(req)
      req.user = req.token.user
      next()
   } catch (e) {
      next(e)
   }
}

interface TokenData {
   token: { id: string }
   user: { id: number }
}

function decodeJWT(token: string, secret: string) {
   try {
      return verify(token, secret) as TokenData
   } catch (e) {
      throw new ApiError(400, e.message)
   }
}

export async function authenticate(req: Request) {
   const [type, access_token] = req.headers.authorization?.split(' ') ?? []

   if (!access_token) throw new ApiError(302, 'You are not logged in')
   if (type !== 'Bearer') throw new ApiError(400, 'Invalid authorization type')

   const decoded = decodeJWT(access_token, jwt.access_secret)

   const token = await Token.findOne(decoded.token.id)
   if (!token) throw new ApiError(400, 'Invalid session')

   return token
}
