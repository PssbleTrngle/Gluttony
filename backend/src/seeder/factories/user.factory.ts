import { define, factory } from 'typeorm-seeding'
import { Faked } from '..'
import Credentials from '../../models/Credentials'
import Session from '../../models/Session'
import User, { UserRole } from '../../models/User'

define(User, (faker, ctx?: { role?: UserRole; sessions?: boolean }) => {
   const user: Faked<User> = new User()

   const firstName = faker.name.firstName()
   const lastName = faker.name.lastName()
   const username = faker.internet.userName(firstName, lastName)

   const created = faker.date.past(2)
   const updated = faker.date.between(created, new Date())
   user.timestamps = { created, updated }

   user.username = username
   user.verified = faker.random.boolean()
   user.credentials = factory(Credentials)({ firstName, lastName, username })

   user.role = ctx?.role ?? UserRole.FAKE

   if (ctx?.sessions) user.sessions = factory(Session)({ user }).makeMany(faker.random.number(8) + 1)

   return user
})

define(Credentials, (faker, ctx?: { firstName?: string; lastName?: string; username?: string }) => {
   const credentials: Faked<Credentials> = new Credentials()

   const firstName = ctx?.firstName ?? faker.name.firstName()
   const lastName = ctx?.lastName ?? faker.name.lastName()

   credentials.email = faker.random.boolean() ? faker.internet.email(firstName, lastName, 'faked.com').toLowerCase() : faker.internet.email(ctx?.username, 'faked.com').toLowerCase()

   credentials.password = '1234'

   return credentials
})
