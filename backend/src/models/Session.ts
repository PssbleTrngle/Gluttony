import { BaseEntity, Column, Entity, ManyToOne } from 'typeorm'
import Hidden from '../decorators/Hidden'
import UUID from '../decorators/UUID'
import Timestamps from './Timestamps'
import User from './User'

@Entity()
export default class Session extends BaseEntity {
   @UUID()
   id!: string

   @Column(() => Timestamps)
   timestamps!: Timestamps

   @ManyToOne(() => User, u => u.sessions, { eager: true, onDelete: 'CASCADE' })
   user!: User

   @Column()
   reason!: string

   @Hidden()
   @Column({ unique: true })
   refresh_token!: string

   @Column('timestamp')
   expires_at!: Date
}
