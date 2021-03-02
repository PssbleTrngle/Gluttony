import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Apikey from "./Apikey";
import Login from "./Login";
import Saved from "./Saved";
import Watched from "./Watched";
import Ranking from "./Ranking";
import Rating from "./Rating";

@Entity()
export default class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ select: false, default: false })
    dev!: boolean;

    @Column({
        unique: true, transformer: {
            to: (v: string) => v.toLowerCase(),
            from: (v: string) => v.toLowerCase(),
        }
    })
    username!: string;

    @Column({ select: false })
    password_hash!: string;

    @Column({ nullable: true })
    email!: string;

    @OneToMany(() => Apikey, k => k.user)
    keys!: Promise<Apikey[]>;

    @OneToMany(() => Login, l => l.user)
    logins!: Promise<Login[]>;

    @OneToMany(() => Saved, s => s.user)
    saved!: Promise<Saved[]>;

    @OneToMany(() => Watched, w => w.user)
    watched!: Promise<Watched[]>;

    @OneToMany(() => Ranking, r => r.user)
    rankings!: Promise<Ranking[]>;

    @OneToMany(() => Rating, r => r.user)
    ratings!: Promise<Rating[]>;

}