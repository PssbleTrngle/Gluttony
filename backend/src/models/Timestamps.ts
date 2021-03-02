import { Column } from 'typeorm'

export default class Timestamps {
   @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
   created!: Date

   @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
   updated!: Date
}
