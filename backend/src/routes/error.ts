import { isCelebrateError } from 'celebrate'
import { IRouter, NextFunction, Request, Response } from 'express'
import { BaseEntity } from 'typeorm'
import config from '../config'
import BadRequestError from '../error/BadRequestError'
import HttpError from '../error/HttpError'

export type StaticEntity<E extends BaseEntity> = typeof BaseEntity & { new (): E }

export default (app: IRouter) => {
   app.use((err: HttpError, _req: Request, _res: Response, next: NextFunction) => {
      if (isCelebrateError(err)) {
         const message = [...err.details.values()].map(e => e.message).join('\n')

         next(new BadRequestError(message))
      } else next(err)
   })

   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
      if (process.env.NODE_ENV === 'development') console.error(err)

      res.status(err.statusCode ?? 500)
      res.json({
         error: {
            message: err.message,
         },
      })
      if (config.api.crashOnError) throw err
   })
}
