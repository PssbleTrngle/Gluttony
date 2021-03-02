import bcrypt from 'bcrypt'
import { createConnection } from 'typeorm'
import config from './config'
import User, { UserRole } from './models/User'

export async function checkAdminUser() {
   const { admin_password } = config.auth
   const admin = await User.findOne({ role: UserRole.ADMIN })

   if (admin) {
      if (admin_password && !bcrypt.compareSync(admin_password, admin.password)) {
         admin.setPassword(admin_password)
         await admin.save()
         console.log('Changed admin password')
      }
   } else {
      await User.register({ username: 'admin', password: admin_password ?? 'admin', role: UserRole.ADMIN })
      console.log('Created admin account')
   }
}

export default async () => {
   const db = await createConnection({ ...config.database })
   await checkAdminUser()
   return db
}
