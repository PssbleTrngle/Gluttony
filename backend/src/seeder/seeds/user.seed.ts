import { Factory, Seeder } from 'typeorm-seeding'
import User from '../../models/User'

export default class UserSeeder implements Seeder {
   public async run(factory: Factory) {
      factory(User)().createMany(120)
   }
}
