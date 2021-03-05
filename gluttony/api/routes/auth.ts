import bcrypt from 'bcrypt'
import { celebrate, Joi } from 'celebrate'
import { IRouter, Request, Router } from 'express'
import { sign } from 'jsonwebtoken'
import { ApiError } from 'next/dist/next-server/server/api-utils'
import config from '../../config'
import { strip } from '../../database/decorators/Hidden'
import Token from '../../database/models/Token'
import User from '../../database/models/User'
import { wrap, wrapAuth } from '../middleware/wrapper'

const { jwt, expires_in } = config.auth

export default (app: IRouter) => {
   const router = Router()
   app.use('/auth', router)

   function refreshLogin(token: Token) {
      const now = new Date().getTime()
      if (now >= token.expires_at.getTime()) throw new ApiError(400, 'Token expired')

      return sign({ user: strip(token.user), token: strip(token) }, jwt.access_secret)
   }

   async function createLogin(user: User, reason: string) {
      const expires_at = new Date().getTime() + expires_in * 3600 * 1000

      const refresh_token = sign({ user: strip(user), expires_at }, jwt.refresh_secret)
      const token = await Token.create({ user, refresh_token, reason, expires_at: new Date(expires_at) }).save()
      const access_token = refreshLogin(token)

      return { refresh_token, access_token }
   }

   router.head(
      '/',
      wrapAuth(
         () => true,
         () => true
      )
   )

   router.post(
      '/',
      celebrate({
         body: {
            username: Joi.string().required(),
            password: Joi.string().required(),
            reason: Joi.string().required(),
         },
      }),
      wrap(async req => {
         const { username, password, reason } = req.body

         const user = await User.createQueryBuilder().where({ username }).orWhere('email = :username', { username }).getOne()

         if (!user) throw new ApiError(400, 'Username does not exist')

         if (bcrypt.compareSync(password, user.password)) return createLogin(user, reason)
         else throw new ApiError(400, 'Invalid password')
      })
   )

   const getToken = async (req: Request) => {
      const { refresh_token } = req.body

      const token = refresh_token && await Token.findOne({ refresh_token })

      if (!token) {
         throw new ApiError(400, 'Invalid Refresh-Token')
      }

      return token
   }

   router.post(
      '/register',
      celebrate({
         body: {
            username: Joi.string().required(),
            password: Joi.string().required(),
            email: Joi.string().required(),
            reason: Joi.string().required(),
         },
      }),
      wrap(async req => {
         if (!config.auth.allowRegister) throw new ApiError(400, 'Registering is disabled')
         const { username, password, email, reason } = req.body

         const user = await User.register({ username, password, email })

         return createLogin(user, reason)
      })
   )

   router.post(
      '/refresh',
      celebrate({
         body: {
            refresh_token: Joi.string().optional(),
         },
      }),
      wrap(async req => {
         const token = await getToken(req)
         const access_token = refreshLogin(token)

         const { refresh_token } = token
         return { refresh_token, access_token }
      })
   )

   router.delete(
      '/',
      wrap(async req => {
         const token = await getToken(req)

         await token.remove()
         return true
      })
   )
}
