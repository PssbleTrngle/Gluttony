import bcrypt from 'bcrypt'
import { celebrate, Joi } from 'celebrate'
import { IRouter, Request, Response, Router } from 'express'
import { sign } from 'jsonwebtoken'
import config from '../config'
import { stripHidden } from '../decorators/Hidden'
import BadRequestError from '../error/BadRequestError'
import { wrap, wrapAuth } from '../middleware/wrapper'
import Token from '../models/Token'
import User from '../models/User'

const { jwt, expires_in } = config.auth

export const TOKEN_COOKIE = 'refresh-token'

export default (app: IRouter) => {
   const router = Router()
   app.use('/auth', router)

   function refreshLogin(token: Token) {
      const now = new Date().getTime()
      if (now >= token.expires_at.getTime()) throw new BadRequestError('Token expired')

      return sign({ user: stripHidden(token.user), token: stripHidden(token) }, jwt.access_secret)
   }

   async function createLogin(user: User, reason: string, res?: Response) {
      const expires_at = new Date().getTime() + expires_in * 3600 * 1000

      const refresh_token = sign({ user: stripHidden(user), expires_at }, jwt.refresh_secret)
      const token = await Token.create({ user, refresh_token, reason, expires_at: new Date(expires_at) }).save()
      const access_token = refreshLogin(token)

      res?.cookie(TOKEN_COOKIE, refresh_token)

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
      wrap(async (req, res) => {
         const { username, password, reason } = req.body

         const user = await User.createQueryBuilder().where({ username }).orWhere('email = :username', { username }).getOne()

         if (!user) throw new BadRequestError('Username does not exist')

         if (bcrypt.compareSync(password, user.password)) return createLogin(user, reason, res)
         else throw new BadRequestError('Invalid password')
      })
   )

   const getToken = async (req: Request, res: Response) => {
      const refresh_token: string = req.cookies[TOKEN_COOKIE]

      const token = refresh_token && (await Token.findOne({ refresh_token }))

      if (!token) {
         res.clearCookie(TOKEN_COOKIE)
         throw new BadRequestError('Invalid Refresh-Token')
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
      wrap(async (req, res) => {
         if (!config.auth.allowRegister) throw new BadRequestError('Registering is disabled')
         const { username, password, email, reason } = req.body

         const user = await User.register({ username, password, email })

         return createLogin(user, reason, res)
      })
   )

   router.post(
      '/refresh',
      celebrate(
         {
            cookies: {
               [TOKEN_COOKIE]: Joi.string().optional(),
            },
         },
         { stripUnknown: true }
      ),
      wrap(async (req, res) => {
         const token = await getToken(req, res)
         const access_token = refreshLogin(token)

         const { refresh_token } = token
         return { refresh_token, access_token }
      })
   )

   router.delete(
      '/',
      celebrate(
         {
            cookies: {
               [TOKEN_COOKIE]: Joi.string().required(),
            },
         },
         { stripUnknown: true }
      ),
      wrap(async (req, res) => {
         const token = await getToken(req, res)

         res.clearCookie(TOKEN_COOKIE)
         await token.remove()
         return true
      })
   )
}
