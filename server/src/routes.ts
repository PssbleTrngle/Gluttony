import { BaseEntity } from 'typeorm';
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

export const Routes: IRoute[] = [
    ...resource('users', User),
    ...resource('apikeys', Apikey, true, { all: true, one: true }),
    ...resource('logins', Login, true, { all: true, one: true, remove: true }),
    ...resource('services', Service),
    ...resource('saved', Saved, true),
    ...resource('watched', Watched, true),
    {
        method: 'get',
        route: '/api/shows/watched',
        controller: WatchedController,
        action: 'shows',
        auth: true,
    },
    ...apiRoutes,
    ...authRoutes,
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
    {
        method: 'get',
        route: '/api/user',
        controller: UserController,
        action: 'get',
        auth: true,
    },
    resources()
];

interface Filter {
    all?: boolean;
    one?: boolean;
    save?: boolean;
    remove?: boolean;
    update?: boolean;
    removeMany?: boolean;
    count?: boolean;
}

/**
 * @param url The base API url
 * @param resource The Entity model
 * @param owned If the entity model should only be accecible to the associated user
 */
function resource<E extends BaseEntity>(url: string, resource: EntityStatic<E>, owned = false, filter?: Filter): IRoute[] {
    const controller = ResourceController(resource, owned);

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
        method: 'post',
        route: `/api/${url}/:id`,
        controller, auth,
        action: 'update'
    }, {
        method: 'delete',
        route: `/api/${url}`,
        controller, auth,
        action: 'removeMany'
    }].filter(({ action }) => !filter || (action in filter && (filter as any)[action]))
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