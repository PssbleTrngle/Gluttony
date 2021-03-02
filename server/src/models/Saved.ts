import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn, Index } from "typeorm";
import User from "./User";

@Entity()
@Index('saved:show_per_user', e => [e.showID, e.user], { unique: true })
export default class Saved extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.saved)
    user!: Promise<User>;

    @Column()
    showID!: number;

}