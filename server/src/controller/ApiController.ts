import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import querystring from 'querystring';
import chalk from 'chalk';
import { debug, error } from '../logging';
import { Request, Response } from 'express';
import Watched from '../models/Watched';
import Token from '../models/Token';

export interface IEpisode {
    id: number;
    airedSeason: number;
    airedEpisodeNumber: number;
    seriesId: number;
    runtime: string;
    firstAired: string;
    watched?: Watched;
}

const { APIURL, APIKEY, ARTURL } = process.env;

function printError(url: string, e: AxiosError) {
    error(`Failed fetching ${chalk.underline(url)} with error`)
    error(e.message);
    if (e.response) error(e.response.data.message ?? JSON.stringify(e.response.data));
    return new Error('Server Error')
}

async function authorize() {

    const now = new Date().getTime();
    const saved = await Token.findOne();
    const expires_after = 1000 * 60 * 60 * 24;
    const next_expire = () => new Date(new Date().getTime() + expires_after);

    try {
        if (saved) {

            if (now > saved.expires_in.getTime()) {

                debug('Refreshing API Token')

                const jwt = await axios.get('https://api.thetvdb.com/refresh_token', {
                    headers: {
                        Authorization: `Bearer ${saved.token}`
                    }
                });

                saved.token = jwt.data.token;
                saved.expires_in = next_expire();
                await saved.save();
            }

            return saved.token;

        } else {

            debug('Requesting API Token')

            const jwt = await axios.post('https://api.thetvdb.com/login', { apikey: APIKEY });
            const token = jwt.data.token;

            await Token.create({ expires_in: next_expire(), token }).save();

            return token;

        }
    } catch (e) {
        printError('login', e);
        return null;
    }

}

async function fetch(endpoint: string, apiurl = APIURL, options: AxiosRequestConfig = {}) {

    const path = `${apiurl}/${endpoint}`;
    //debug(`Requesting ${chalk.underline(path)}`);

    const token = await authorize();
    const config: AxiosRequestConfig = {
        headers: {
            Authorization: `Bearer ${token}`,
            'Accept-Language': 'english',
        },
        ...options,
    }

    try {
        const response = await axios.get(path, config);
        return response.data;
    } catch (e) {
        printError(path, e);
        throw new Error('Not found')
    }

}

async function getRuntime(e: IEpisode) {
    const show = await ApiController.getShow(e.seriesId);
    return show.runtime;
}
export default class ApiController {

    async episodes(req: Request) {
        const { id } = req.params;
        return await ApiController.getShowEpisodes(id, true);
    }

    static async getShow(id: number | string) {
        return await fetch(`series/${id}`).then(r => r.data);
    }

    static async getEpisode(id: number | string) {
        const episode = await fetch(`episodes/${id}`).then(r => r.data);
        const runtime = await getRuntime(episode);
        const watched = await Watched.findOne({ episodeID: typeof id === 'number' ? id : Number.parseInt(id) });
        return { ...episode, runtime, watched } as IEpisode;
    }

    static async getShowEpisodes(id: number | string, withWatched: boolean) {
        const { data, links } = await fetch(`series/${id}/episodes`);
        const runtime = await getRuntime(data[0]);

        const pages = new Array(links.last).fill(null).map((_, i) => i + 1).filter(i => i > 1);
        const rest = await Promise.all(pages.map(p =>
            fetch(`series/${id}/episodes?page=${p}`).then(r => r.data)
        ))

        const found: IEpisode[] = [...data, ...rest.reduce((t, a) => [...t, ...a], [])];

        const episodes = found
            .filter(e => e.airedSeason > 0 && e.firstAired)
            .sort((e1, e2) => (e1.airedSeason - e2.airedSeason) * 1000 + e1.airedEpisodeNumber - e2.airedEpisodeNumber)
            .map((e, i) => ({
                ...e, ...{
                    airedEpisodeNumber: i + 1,
                    runtime
                }
            }));

        if (!withWatched) return episodes;

        return Promise.all(episodes.map(async e => {
            const watched = await Watched.findOne({ episodeID: e.id })
            return { ...e, watched };
        }));
    }

    async show(req: Request) {
        const { id } = req.params;
        return ApiController.getShow(id);
    }

    async episode(req: Request) {
        const { id } = req.params;
        return ApiController.getEpisode(id);
    }

    async search(req: Request) {
        const valid = ['name', 'imdbId', 'zap2itId', 'slug'];
        const by = querystring.stringify(Object.keys(req.query)
            .filter(k => valid.includes(k))
            .reduce((o, k) => ({ ...o, [k]: req.query[k] }), {})
        );

        try {

            const response = await fetch(`search/series?${by}`);
            return response.data;

        } catch (e) {
            return [];
        }
    }

    async searchOne(req: Request) {
        return this.search(req).then(a => a[0]);
    }

    async image(req: Request, res: Response) {
        const { path } = req.params;
        const data = await fetch(path, ARTURL, { responseType: 'arraybuffer' })
        res.writeHead(200, {
            'Content-Type': 'image/jpg',
            'Content-Length': data.length
        })
        res.end(data);
    }
}