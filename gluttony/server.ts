import bodyParser from 'body-parser'
import express, { Router } from "express"
import next from 'next'
import auth from './api/routes/auth'
import error from './api/routes/error'
import token from "./api/routes/token"
import config from "./config"
import database from "./database/loader"

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(async () => {
   const server = express()

   //server.use(cors())
   server.use(bodyParser.json())
   server.use(bodyParser.urlencoded({ extended: true }))
   //server.use(cookieParser())

   const api = Router()
   server.use('/api', api)
   
   auth(api)
   token(api)

   error(api)

   server.all('*', (req, res) => {
      return handle(req, res)
   })

   await database()

   server.listen(config.api.port, () => {
      console.log(`> Ready on http://localhost:${config.api.port}`)
   })
})