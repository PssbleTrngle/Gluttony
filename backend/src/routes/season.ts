import { celebrate, Joi } from 'celebrate'
import { IRouter, Router } from 'express'
import { BaseEntity } from 'typeorm'
import api from '../api'
import { wrap } from '../middleware/wrapper'

export type StaticEntity<E extends BaseEntity> = typeof BaseEntity & { new (): E }

export default (app: IRouter) => {
   const router = Router()
   app.use('/season', router)

   router.get(
      '/:id',
      celebrate({
         params: {
            id: Joi.string().required(),
         },
      }),
      wrap(async req => {
         const show = await api.getSeason(req.params.id)
         return show
      })
   )
}
