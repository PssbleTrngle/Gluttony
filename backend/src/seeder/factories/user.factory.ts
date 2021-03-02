import Faker from 'faker'
import { define } from 'typeorm-seeding'
import { Faked } from '..'
import User, { UserRole } from '../../models/User'

define(User, (faker: typeof Faker, ctx?: { role?: UserRole }) => {
   const user: Faked<User> = new User()

   const firstName = faker.name.firstName()
   const lastName = faker.name.lastName()

   const created = faker.date.past(2)
   const updated = faker.date.between(created, new Date())
   user.timestamps = { created, updated }

   user.email = faker.internet.email(firstName, lastName)
   user.password = '1234'
   user.role = ctx?.role ?? UserRole.FAKE

   return user
})
