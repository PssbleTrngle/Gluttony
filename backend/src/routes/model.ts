import { celebrate, Joi } from 'celebrate'
import { IRouter, Router } from 'express'
import { BaseEntity, Like } from 'typeorm'
import { wrapAuth } from '../middleware/wrapper'

export type StaticEntity<E extends BaseEntity> = typeof BaseEntity & { new (): E }

export default <E extends BaseEntity>(Model: StaticEntity<E>, path?: string) => (app: IRouter) => {
   const router = Router()
   app.use(path ?? `/${Model.name}`, router)

   router.get(
      '/',
      celebrate({
         query: {
            limit: Joi.number().default(100).min(0),
            offset: Joi.number().default(0).min(0),
            search: Joi.string().optional(),
         },
      }),
      wrapAuth(async req =>
         Model.find({
            where: { name: Like(`%${req.params.search?.trim() ?? ''}%`) },
            take: Number.parseInt(req.query.limit as string),
            skip: Number.parseInt(req.query.offset as string),
         })
      )
   )

   router.get(
      '/:id',
      celebrate({
         params: {
            id: Joi.number(),
         },
      }),
      wrapAuth(async req => Model.findOne(Number.parseInt(req.params.id)))
   )
}
