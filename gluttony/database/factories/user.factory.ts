import { define, factory } from 'typeorm-seeding'
import Token from '../../models/Token'
import User, { UserRole } from '../../models/User'
import { Faked } from '../seeder'

define(User, (faker, ctx?: { role?: UserRole, tokens?: boolean }) => {
   const user: Faked<User> = new User()

   const firstName = faker.name.firstName()
   const lastName = faker.name.lastName()

   const created = faker.date.past(2)
   const updated = faker.date.between(created, new Date())
   user.timestamps = { created, updated }

   user.username = faker.internet.userName(firstName, lastName)

   user.email = faker.random.boolean()
      ? faker.internet.email(firstName, lastName, 'faked.com').toLowerCase()
      : faker.internet.email(user.username, 'faked.com').toLowerCase()
   user.emailVerified = faker.random.boolean()

   user.password = '1234'
   user.role = ctx?.role ?? UserRole.FAKE

   if (ctx?.tokens) user.tokens = factory(Token)({ user }).makeMany(faker.random.number(8) + 1)

   return user
})
