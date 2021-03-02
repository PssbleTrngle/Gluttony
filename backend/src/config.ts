import dotenv from 'dotenv'
import { resolve } from 'path'
import { ConnectionOptions } from 'typeorm'

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

const database: ConnectionOptions = {
   synchronize: env.DATABASE_SYNC === 'true',
   host: env.DATABASE_HOST,
   port: integer(env.DATABASE_PORT) ?? 5432,
   database: env.DATABASE_NAME ?? 'calender',
   username: env.DATABASE_USER ?? env.DATABASE_NAME ?? 'calender',
   password: env.DATABASE_PASS,
   logging: env.DATABASE_LOGGING === 'true',
   type: 'postgres',
   uuidExtension: 'uuid-ossp',
   entities: [`${resolve(__dirname, 'models')}/**.{js,ts}`],
   migrations: [`${resolve(__dirname, 'migrations')}/**.{js,ts}`],
   cli: {
      migrationsDir: resolve(__dirname, 'migrations'),
   },
}

const api = {
   port: integer(env.PORT) ?? 80,
   extension: env.API_EXTENSION || 'api',
   logging: env.API_LOGGING === 'true',
   crashOnError: false,
   staticDir: env.STATIC_DIR,
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

const tvdb = {
   key: required('TVDB_API_KEY'),
   url: env.TVDB_API_URL ?? 'https://api.thetvdb.com',
   art: env.TVDB_ART_URL ?? 'https://artworks.thetvdb.com/banners',
}

export default { database, api, auth, tvdb }