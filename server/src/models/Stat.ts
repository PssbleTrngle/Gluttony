import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn, Index } from "typeorm";
import User from "./User";
import Timestamps from "./Timestamps";

@Entity()
@Index('stat:name_per_user', e => [e.name, e.user], { unique: true })
export default class Stat extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        transformer: {
            to: s => s.toLowerCase(),
            from: s => s.toLowerCase(),
        }
    })
    name!: string;

    @Column(() => Timestamps)
    timestamps!: Timestamps;

    @ManyToOne(() => User, user => user.watched)
    user!: Promise<User>;

    @Column({ nullable: true })
    value?: number;

    @Column({ default: false })
    locked!: boolean;

}