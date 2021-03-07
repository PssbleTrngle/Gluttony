import bcrypt from 'bcrypt'
import { celebrate, Joi } from 'celebrate'
import { IRouter, Request, Response, Router } from 'express'
import { sign } from 'jsonwebtoken'
import { IsNull, Not } from 'typeorm'
import config from '../config'
import { stripHidden } from '../decorators/Hidden'
import BadRequestError from '../error/BadRequestError'
import { wrap, wrapAuth } from '../middleware/wrapper'
import Session from '../models/Session'
import User from '../models/User'

const { jwt, expires_in } = config.auth

export const SESSION_COOKIE = 'refresh-token'

export default (app: IRouter) => {
   const router = Router()
   app.use('/auth', router)

   function refreshLogin(token: Session) {
      const now = new Date().getTime()
      if (now >= token.expires_at.getTime()) throw new BadRequestError('Token expired')

      return sign({ user: stripHidden(token.user), token: stripHidden(token) }, jwt.access_secret)
   }

   async function createLogin(user: User, reason: string, res?: Response) {
      const expires_at = new Date().getTime() + expires_in * 3600 * 1000

      const refresh_token = sign({ user: stripHidden(user), expires_at }, jwt.refresh_secret)
      const session = await Session.create({ user, refresh_token, reason, expires_at: new Date(expires_at) }).save()
      const access_token = refreshLogin(session)

      res?.cookie(SESSION_COOKIE, refresh_token)

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

         const user = await User.createQueryBuilder('user')
            .where({ username, credentials: Not(IsNull()) })
            .orWhere('creds.email = :username', { username })
            .leftJoinAndSelect('user.credentials', 'creds')
            .getOne()

         if (!user?.credentials) throw new BadRequestError('User does not exist')

         if (bcrypt.compareSync(password, user.credentials.password)) return createLogin(user, reason, res)
         else throw new BadRequestError('Invalid password')
      })
   )

   const getSession = async (req: Request, res: Response) => {
      const refresh_token: string = req.cookies[SESSION_COOKIE]

      const session = refresh_token && (await Session.findOne({ refresh_token }))

      if (!session) {
         res.clearCookie(SESSION_COOKIE)
         throw new BadRequestError('Invalid Refresh-Token')
      }

      return session
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
               [SESSION_COOKIE]: Joi.string().optional(),
            },
         },
         { stripUnknown: true }
      ),
      wrap(async (req, res) => {
         const session = await getSession(req, res)
         const access_token = refreshLogin(session)

         const { refresh_token } = session
         return { refresh_token, access_token }
      })
   )

   router.delete(
      '/',
      celebrate(
         {
            cookies: {
               [SESSION_COOKIE]: Joi.string().required(),
            },
         },
         { stripUnknown: true }
      ),
      wrap(async (req, res) => {
         const session = await getSession(req, res)

         res.clearCookie(SESSION_COOKIE)
         await session.remove()
         return true
      })
   )
}
