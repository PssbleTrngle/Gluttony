import { celebrate, Joi } from 'celebrate'
import { IRouter, Router } from 'express'
import { BaseEntity } from 'typeorm'
import { stripHidden } from '../decorators/Hidden'
import BadRequestError from '../error/BadRequestError'
import { wrapAuth } from '../middleware/wrapper'
import Token from '../models/Token'
import { TOKEN_COOKIE } from './auth'

export type StaticEntity<E extends BaseEntity> = typeof BaseEntity & { new (): E }

export default (app: IRouter) => {
   const router = Router()
   app.use('/token', router)

   router.get(
      '/',
      wrapAuth(async req => {
         const tokens = await Token.find({ user: req.user })
         return tokens.map(t => ({ ...stripHidden(t), active: req.token.id === t.id }))
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
         const token = await Token.findOne(req.params.id)

         if (!token) return null
         if (token.refresh_token === req.cookies[TOKEN_COOKIE]) throw new BadRequestError('Cannot delete token in use')

         await token.remove()
         return true
      })
   )
}
