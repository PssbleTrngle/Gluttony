import dotenv from 'dotenv'
import { join } from "path"
import { ConnectionOptions } from "typeorm-seeding"

dotenv.config()

const { env } = process

const required = (key: string) => {
   const value = env[key]
   if (value) return value
   else throw new Error(`Missing config option '${key}'`)
}

const integer = (s?: string) => {
   const n = Number.parseInt(s ?? '')
   return isNaN(n) ? undefined : n
}

const files = (folder: string) => [`${join(__dirname, 'database', folder)}/**.ts`, `${join(__dirname, 'database', folder)}/**.js`]

const api = {
   port: integer(env.PORT) ?? 80,
}

const auth = {
   admin_password: env.ADMIN_PASSWORD,
   jwt: {
      access_secret: required('JWT_ACCESS_SECRET'),
      refresh_secret: required('JWT_REFRESH_SECRET'),
   },
   expires_in: integer(env.TOKEN_EXPIRES_IN) ?? 24,
   allowRegister: env.ALLOW_REGISTER === 'true',
}

const database: ConnectionOptions = {
   synchronize: env.DATABASE_SYNC === 'true',
   host: env.DATABASE_HOST,
   port: integer(env.DATABASE_PORT) ?? 5432,
   database: env.DATABASE_NAME ?? 'gluttony',
   username: env.DATABASE_USER ?? env.DATABASE_NAME ?? 'gluttony',
   password: env.DATABASE_PASS,
   logging: env.DATABASE_LOGGING === 'true',
   type: 'postgres',
   entities: files('models'),
   seeds: files('seeds'),
   factories: files('factories'),
}

const discord = {
   clientId: required('DISCORD_CLIENT_ID'),
   clientSecret: required('DISCORD_CLIENT_SECRET'),
}

const mailHost = required('MAIL_HOST')
const mailUser = env.MAIL_USER ?? 'noreply'

const mail = {
   server: {
      host: mailHost,
      port: integer(env.MAIL_PORT) ?? 25,
      auth: {
         user: mailUser,
         pass: required('MAIL_PASS'),
      }
   },
   from: env.MAIL_FROM ?? `${mailUser}@${mailHost}`,
}

export default { api, database, discord, mail, auth }