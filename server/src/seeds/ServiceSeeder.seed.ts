import { Connection, DeepPartial } from "typeorm";
import { Factory, Seeder } from "typeorm-seeding";
import { Service } from "../models/Service";

export default class ServiceSeeder implements Seeder {
    public async run(_: Factory, connection: Connection) {

        const services: { [K in keyof Service]?: Service[K] }[] = []

        if (process.env.NODE_ENV === 'development') {
            await Service.delete({});
        }

        await connection
            .createQueryBuilder()
            .insert()
            .into(Service)
            .values(services)
            .execute()

    }
}