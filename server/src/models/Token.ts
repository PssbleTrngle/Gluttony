import { Column, Entity, PrimaryGeneratedColumn, BaseEntity, ManyToOne } from "typeorm";
import User from "./User";
import Timestamps from "./Timestamps";

@Entity()
export default class Token extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    expires_in!: Date

    @Column()
    token!: string;

}
