import { BaseEntity, DeepPartial } from "typeorm";
import { AuthRequest } from "..";
import Timestamps from "../models/Timestamps";
import User from "../models/User";
import Watched from "../models/Watched";

export class HttpError extends Error {
    constructor(public status_code: number, message?: string) {
        super(message);
    }
}

export interface IEntity extends BaseEntity {
    user?: User | Promise<User>;
    timestamps?: Timestamps;
}
export type EntityStatic<E extends IEntity> = { new(): E } & typeof BaseEntity;

/**
 * @param Resource The Entity model
 * @param owned If the entity model should only be accecible to the associated user
 */
export default function <E extends IEntity>(Resource: EntityStatic<E>, owned: boolean) {
    return class ResourceController {

        private async authorized(entity: IEntity | undefined | null, req: AuthRequest) {
            if (owned && entity) {
                const user = await entity.user;
                if (!user) throw new Error(`User not included in owned entity ${Resource}`)
                if (user.id !== req.user.id) {
                    throw new HttpError(401, 'Not authorized')
                }
            }
        }

        async all(req: AuthRequest) {

            const getNumber = (key: string) => {
                const i = Number.parseInt((req.query[key] ?? '').toString());
                return isNaN(i) ? undefined : i;
            }

            const limit = getNumber('limit') ?? 100;
            const offset = getNumber('offset') ?? 0;

            const resources: IEntity[] = await Resource.find({
                where: owned ? { user: req.user } : {},
                take: limit, skip: offset,
            });

            return resources;
        }

        async count(req: AuthRequest) {
            const count = await Resource.count({
                where: owned ? { user: req.user } : {},
            });

            return { count };
        }

        async one(req: AuthRequest) {
            const entity = await Resource.findOne<IEntity>(req.params.id);
            await this.authorized(entity, req);
            return entity;
        }

        async save(req: AuthRequest) {
            const values: DeepPartial<typeof Resource>[] = Array.isArray(req.body) ? req.body : [req.body];
            const resources = Resource.create(values.map(v => ({ ...v, user: req.user })));
            return Promise.all(resources.map(r => r.save())).then(() => 201);
        }

        async update(req: AuthRequest) {
            const entity = await Resource.findOne<IEntity>(req.params.id);
            await this.authorized(entity, req);
            return Resource.getRepository().update(req.params.id, req.body)
        }

        async remove(req: AuthRequest) {
            const entity = await Resource.findOne<IEntity>(req.params.id);
            await this.authorized(entity, req);
            return entity?.remove();
        }

        async removeMany(req: AuthRequest) {
            const { ids } = req.body;

            const o = owned ? { user: req.user } : {}
            //@ts-ignore
            await Promise.all(ids.map(id => Watched.delete({ ...o, id })));

            /*
            await Resource.createQueryBuilder()
                .where(owned ? { userId: req.user.id } : {})
                .andWhere(() => 'id IN (:ids)', { ids })
                .delete()
                .execute();
            */

            return true;
        }

    }
}