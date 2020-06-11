export interface IModel {
    id: number;
}

export interface ITimestamps {
    created: number;
    updated: number;
}

export interface IOwned extends IModel {
    user: IUser;
}

export interface IUser extends IModel {
    username: string;
    email?: string;
}

export interface IApiKey extends IModel {
    timestamps: ITimestamps;
    key: string;
    purpose: string;
}

export interface IService extends IModel {
    name: string;
}

export interface ILogin extends IModel {
    service: IService;
    user: IUser;
    apiId: string | number;
}

export interface IEpisode {
    id: number;
    episodeName: string;
    overview: string;
    firstAired: string;
    airedSeason: number;
    airedEpisodeNumber: number;
    seriesId: number;
    runtime: number;
    watched?: {
        id: number;
        timestamps: ITimestamps;
    };
}

export interface IShowSearch {
    banner: string;
    poster: string;
    firstAired: string;
    id: number;
    network: string;
    overview: string;
    seriesName: string;
    slug: string;
    status: 'Ended' | 'Ongoing' | string;
}

export interface IShow extends IShowSearch {
    season: string;
    genre: string[];
}

export interface IWatched extends IModel {
    showID: number;
    episodeID: number;
}

export interface IStat extends IModel {
    value?: number;
    name: string;
    locked: boolean;
    timestamps: ITimestamps;
}

export type IList<T> = Array<T>;