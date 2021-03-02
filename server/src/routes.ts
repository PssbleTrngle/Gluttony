import { BaseEntity, LessThanOrEqual } from 'typeorm';
import AuthController from './controller/AuthController';
import ResourceController, { EntityStatic } from './controller/ResourceController';
import ServiceController from './controller/ServiceController';
import UserController from './controller/UserController';
import Apikey from './models/Apikey';
import Login from './models/Login';
import { Service } from './models/Service';
import User from './models/User';
import Saved from './models/Saved';
import Watched from './models/Watched';
import ApiController from './controller/ApiController';
import WatchedController from './controller/WatchedController';
import StatController from './controller/StatController';
import Rating from './models/Rating';
import Category from './models/Category';
import Ranking from './models/Ranking';
import RankingController from './controller/RankingController';

interface IRoute {
    method: string;
    route: string;
    controller: any;
    action: string;
    auth?: boolean;
}

const Resources: {
    url: string;
    owned: boolean;
    filter?: Filter;
}[] = [];

interface Filter {
    all: boolean;
    one: boolean;
    save: boolean;
    remove: boolean;
    update: boolean;
    removeMany: boolean;
    count: boolean;
    forShow: boolean;
    shows: boolean;
}

const defaultFilter: Filter = {
    all: true,
    one: true,
    save: true,
    remove: true,
    update: true,
    removeMany: true,
    count: true,
    forShow: false,
    shows: false,
}

/**
 * @param url The base API url
 * @param resource The Entity model
 * @param owned If the entity model should only be accecible to the associated user
 */
function resource<E extends BaseEntity>(url: string, resource: EntityStatic<E>, owned = false, f?: Partial<Filter>): IRoute[] {
    const controller = ResourceController(resource, owned);

    const filter: Filter = {
        ...defaultFilter,
        ...f,
    }

    Resources.push({ url, owned, filter })
    const auth = owned;

    return [{
        method: 'get',
        route: `/api/${url}`,
        controller, auth,
        action: 'all'
    }, {
        method: 'get',
        route: `/api/${url}/count`,
        controller, auth,
        action: 'count'
    }, {
        method: 'get',
        route: `/api/${url}/:id`,
        controller, auth,
        action: 'one'
    }, {
        method: 'post',
        route: `/api/${url}`,
        controller, auth,
        action: 'save'
    }, {
        method: 'delete',
        route: `/api/${url}/:id`,
        controller, auth,
        action: 'remove'
    }, {
        method: 'put',
        route: `/api/${url}/:id`,
        controller, auth,
        action: 'update'
    }, {
        method: 'delete',
        route: `/api/${url}`,
        controller, auth,
        action: 'removeMany'
    },
    {
        method: 'get',
        route: `/api/shows/${url}`,
        controller, auth,
        action: 'shows',
    },
    {
        method: 'get',
        route: `/api/shows/:id/${url}`,
        controller, auth,
        action: 'forShow',
    }].filter(({ action }) => (filter as any)[action])
}/**
 * @param url The base API url
 * @param resource The Entity model
 * @param owned If the entity model should only be accecible to the associated user
 */
function resourceWithShow<E extends BaseEntity>(url: string, r: EntityStatic<E>, owned = false, f?: Partial<Filter>): IRoute[] {
    const filter: Partial<Filter> = {
        ...f,
        forShow: true,
        shows: true,
    }
    return resource(url, r, owned, filter);
}

function resources(): IRoute {
    return {
        method: 'get',
        route: '/api/endpoints',
        controller: class {
            all = () => Resources;
        },
        action: 'all'
    }
}

const authRoutes: IRoute[] = [
    {
        method: 'post',
        route: '/auth/:name',
        controller: ServiceController,
        action: 'authorize',
        auth: true,
    },
    {
        method: 'get',
        route: '/auth/:name',
        controller: ServiceController,
        action: 'redirect'
    },
    {
        method: 'post',
        route: '/api/apikey',
        controller: AuthController,
        action: 'login',
    },
    {
        method: 'delete',
        route: '/api/apikey',
        controller: AuthController,
        action: 'logout',
        auth: true,
    },
]

const apiRoutes: IRoute[] = [
    {
        method: 'get',
        route: '/img/:path(*)',
        action: 'image',
        controller: ApiController,
    },
    {
        method: 'get',
        route: '/api/shows/search',
        action: 'search',
        controller: ApiController,
    },
    {
        method: 'get',
        route: '/api/shows/:id/episodes',
        action: 'episodes',
        controller: ApiController,
    },
    {
        method: 'get',
        route: '/api/shows/:id',
        action: 'show',
        controller: ApiController,
    },
    {
        method: 'get',
        route: '/api/episodes/:id',
        action: 'episode',
        controller: ApiController,
    },
]

const watchedRoutes: IRoute[] = [
    {
        method: 'post',
        route: '/api/watched/import',
        controller: WatchedController,
        action: 'import',
        auth: true,
    },
    ...resourceWithShow('watched', Watched, true),
]

const statRoutes: IRoute[] = [
    {
        method: 'get',
        route: '/api/stats/:name',
        action: 'value',
        controller: StatController,
        auth: true,
    },
    {
        method: 'post',
        route: '/api/stats/:name',
        action: 'calculate',
        controller: StatController,
        auth: true,
    },
]

const ratingRoutes: IRoute[] = [
    ...resourceWithShow('ratings', Rating, true),
]

const rankingRoutes: IRoute[] = [
    {
        method: 'get',
        route: '/api/rankings/pair',
        action: 'pair',
        controller: RankingController,
        auth: true,
    },
    ...resourceWithShow('rankings', Ranking, true),
]

export const Routes: IRoute[] = [
    ...resource('users', User),
    ...resource('apikeys', Apikey, true, { save: false, update: false }),
    ...resource('logins', Login, true, { save: false, update: false }),
    ...resource('services', Service, false, { save: false, update: false, remove: false, removeMany: false }),
    ...resourceWithShow('saved', Saved, true),
    ...resource('categories', Category),
    ...ratingRoutes,
    ...rankingRoutes,
    ...watchedRoutes,
    ...apiRoutes,
    ...authRoutes,
    ...statRoutes,
    {
        method: 'get',
        route: '/api/user',
        controller: UserController,
        action: 'get',
        auth: true,
    },
    resources()
];