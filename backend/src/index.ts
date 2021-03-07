import bodyParser from 'body-parser'
import chalk from 'chalk'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import api from './api'
import config from './config'
import database from './database'
import routes from './routes'

async function run() {
   await Promise.all([database(), api.login()])

   const app = express()

   app.use(cors())
   app.use(bodyParser.json())
   app.use(bodyParser.urlencoded({ extended: true }))
   app.use(cookieParser())

   routes(app)

   app.listen(config.api.port, () => {
      console.log(chalk`Listening on {underline http://localhost:${config.api.port}}`)
      console.log()
   })
}

run().catch(e => console.error(e))
