import bcrypt from 'bcrypt'
import { celebrate, Joi } from 'celebrate'
import { Router } from 'express'
import { sign } from 'jsonwebtoken'
import config from '../config'
import { stripHidden } from '../decorators/Hidden'
import BadRequestError from '../error/BadRequestError'
import { wrap, wrapAuth } from '../middleware/wrapper'
import Token from '../models/Token'
import User from '../models/User'

const { jwt, expires_in } = config.auth

export default () => {
   const router = Router()

   function refreshLogin(token: Token) {
      const now = new Date().getTime()
      if (now >= token.expires_at.getTime()) throw new BadRequestError('Token expired')

      return sign({ user: stripHidden(token.user), token: stripHidden(token) }, jwt.access_secret)
   }

   async function createLogin(user: User) {
      const expires_at = new Date().getTime() + expires_in * 3600 * 1000

      const refresh_token = sign({ user: stripHidden(user), expires_at }, jwt.refresh_secret)
      const token = await Token.create({ user, refresh_token, expires_at: new Date(expires_at) }).save()
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
      '/refresh',
      celebrate({
         cookies: {
            refresh_token: Joi.string().required(),
         },
      }),
      wrap(async req => {
         const { refresh_token } = req.body

         const token = await Token.findOne({ refresh_token })
         if (!token) throw new BadRequestError('Invalid Refresh-Token')

         const access_token = refreshLogin(token)
         return { refresh_token, access_token }
      })
   )

   router.post(
      '/',
      celebrate({
         body: {
            username: Joi.string().required(),
            password: Joi.string().required(),
         },
      }),
      wrap(async req => {
         const { username, password } = req.body

         const user = await User.findOne({ username })
         if (!user) throw new BadRequestError('Username does not exist')

         if (bcrypt.compareSync(password, user.password)) return createLogin(user)
         else throw new BadRequestError('Invalid password')
      })
   )

   router.post(
      '/register',
      celebrate({
         body: {
            username: Joi.string().required(),
            password: Joi.string().required(),
            email: Joi.string().required(),
         },
      }),
      wrap(async req => {
         if (!config.auth.allowRegister) throw new BadRequestError()
         const { username, password, email } = req.body

         const user = await User.register({ username, password, email })

         return createLogin(user)
      })
   )

   return router
}
