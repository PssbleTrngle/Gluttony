import { runSeeder, tearDownDatabase, useRefreshDatabase, useSeeding } from 'typeorm-seeding'
import { EntityFactory } from 'typeorm-seeding/dist/entity-factory'
import databaseLoader, { checkAdminUser } from '../database'
import UserSeeder from './seeds/user.seed'

export type Faked<T> = {
   [P in keyof T]: T[P] | EntityFactory<T[P], unknown> | Promise<T[P]>
}

async function run() {
   const { name: connection } = await databaseLoader()

   console.log('Database loaded')

   await useRefreshDatabase({ connection })
   await checkAdminUser()
   console.log('Database refreshed')

   await useSeeding({ connection })
   console.log('Seeds loaded')

   await runSeeder(UserSeeder)

   await tearDownDatabase()
}

run()
   .then(() => process.exit(0))
   .catch(e => {
      console.error(e)
      process.exit(-1)
   })
