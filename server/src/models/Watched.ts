import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn, Index } from "typeorm";
import User from "./User";
import Timestamps from "./Timestamps";

@Entity()
@Index('episode_per_user', e => [e.episodeID, e.user], { unique: true })
export default class Watched extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column(() => Timestamps)
    timestamps!: Timestamps;

    @ManyToOne(() => User, user => user.watched)
    user!: Promise<User>;

    @Column()
    episodeID!: number;

    @Column()
    showID!: number;

}