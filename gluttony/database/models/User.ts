import bcrypt from 'bcrypt'
import { ApiError } from 'next/dist/next-server/server/api-utils'
import { BaseEntity, BeforeInsert, Column, Entity, OneToMany } from 'typeorm'
import Hidden from '../decorators/Hidden'
import UUID from '../decorators/UUID'
import Timestamps from './Timestamps'
import Token from './Token'

export enum UserRole {
   ADMIN = 'admin',
   USER = 'user',
   FAKE = 'fake',
}

@Entity()
export default class User extends BaseEntity {
   @UUID()
   id!: string

   @Column(() => Timestamps)
   timestamps!: Timestamps

   @Column({ unique: true })
   username!: string

   @Column({ unique: true, nullable: true })
   email?: string

   @Column({ default: false })
   emailVerified!: boolean

   @Hidden()
   password!: string

   @Hidden()
   salt!: string

   @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
   role!: UserRole

   @OneToMany(() => Token, t => t.user, { cascade: true })
   tokens!: Promise<Partial<Token>[]>

   @BeforeInsert()
   async setPassword(password?: string) {
      this.salt ??= bcrypt.genSaltSync()
      this.password = bcrypt.hashSync(password ?? this.password, this.salt)
   }

   static async register(data: { username: string; email?: string; password: string; role?: UserRole }) {
      const { username, email } = data

      const existing = await User.createQueryBuilder().orWhere('(email IS NOT NULL AND email = :email) OR username = :username', { email, username }).getOne()

      if (existing) throw new ApiError(400, 'User with this username does already exist')

      return await User.create(data).save()
   }
}
