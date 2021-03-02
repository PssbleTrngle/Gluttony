import { Router } from 'express'
import { BaseEntity } from 'typeorm'
import { stripHidden } from '../decorators/Hidden'
import { wrapAuth } from '../middleware/wrapper'
import Token from '../models/Token'

export type StaticEntity<E extends BaseEntity> = typeof BaseEntity & { new (): E }

export default () => {
   const router = Router()

   router.get(
      '/',
      wrapAuth(async req => {
         const tokens = await Token.find({ user: req.user })
         return tokens.map(t => ({ ...stripHidden(t), active: req.token.id === t.id }))
      })
   )

   return router
}
