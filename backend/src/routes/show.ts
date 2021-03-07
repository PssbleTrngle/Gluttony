import { celebrate, Joi } from 'celebrate'
import { IRouter, Router } from 'express'
import { BaseEntity } from 'typeorm'
import api from '../api'
import { wrap } from '../middleware/wrapper'

export type StaticEntity<E extends BaseEntity> = typeof BaseEntity & { new (): E }

export default (app: IRouter) => {
   const router = Router()
   app.use('/show', router)

   router.get(
      '/:slug',
      celebrate({
         params: {
            slug: Joi.string().required(),
         },
      }),
      wrap(async req => {
         const show = await api.findShow(req.params.slug)
         return show
      })
   )
}
