import { celebrate, Joi } from 'celebrate'
import { IRouter, Router } from 'express'
import { BaseEntity } from 'typeorm'
import { stripHidden } from '../decorators/Hidden'
import BadRequestError from '../error/BadRequestError'
import { wrapAuth } from '../middleware/wrapper'
import Session from '../models/Session'
import { SESSION_COOKIE } from './auth'

export type StaticEntity<E extends BaseEntity> = typeof BaseEntity & { new (): E }

export default (app: IRouter) => {
   const router = Router()
   app.use('/session', router)

   router.get(
      '/',
      wrapAuth(async req => {
         const sessions = await Session.find({ user: req.user })
         return sessions.map(t => ({ ...stripHidden(t), active: req.session.id === t.id }))
      })
   )

   router.delete(
      '/:id',
      celebrate({
         params: {
            id: Joi.string().required(),
         },
      }),
      wrapAuth(async req => {
         const session = await Session.findOne(req.params.id)

         if (!session) return null
         if (session.refresh_token === req.cookies[SESSION_COOKIE]) throw new BadRequestError('Cannot delete token in use')

         await session.remove()
         return true
      })
   )
}
