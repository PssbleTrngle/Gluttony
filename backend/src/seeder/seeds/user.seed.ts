import { Factory, Seeder } from 'typeorm-seeding'
import User from '../../models/User'

export default class UserSeeder implements Seeder {
   public async run(factory: Factory) {
      await factory(User)({ tokens: true }).createMany(120)
   }
}
