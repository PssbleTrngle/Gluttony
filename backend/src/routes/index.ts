import express, { Application, Router } from 'express'
import { join } from 'path'
import config from '../config'
import NotFoundError from '../error/NotFoundError'
import auth from './auth'
import error from './error'
import token from './session'
import show from './show'

export default (app: Application) => {
   const router = Router()
   app.use(`/${config.api.extension}`, router)

   if (config.api.logging)
      router.use((req, _, next) => {
         console.log(`[${req.method.toUpperCase()}] -> ${req.path}`)
         next()
      })

   router.head('/status', (_, res) => {
      res.status(200).end()
   })

   router.get('/status', (_, res) => {
      res.status(200).end()
   })

   auth(router)
   token(router)
   show(router)

   router.use('*', (_req, _res, next) => next(new NotFoundError()))

   if (config.api.staticDir) {
      const dir = config.api.staticDir
      app.use(express.static(dir))
      app.get('*', (_, res) => res.sendFile(join(dir, 'index.html')))
   }

   error(app)
}
