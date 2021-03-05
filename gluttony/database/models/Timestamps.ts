import { CreateDateColumn, UpdateDateColumn } from 'typeorm'

export default class Timestamps {
   
   @CreateDateColumn()
   created!: Date

   @UpdateDateColumn()
   updated!: Date
}
