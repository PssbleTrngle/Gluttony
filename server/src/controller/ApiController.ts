import { Request, Response } from 'express';
import Api from '../Api';

export default class ApiController {

    async episodes(req: Request) {
        const { id } = req.params;
        return await Api.getShowEpisodes(id);
    }

    async show(req: Request) {
        const { id } = req.params;
        return Api.getShow(id);
    }

    async episode(req: Request) {
        const { id } = req.params;
        return Api.getEpisode(id);
    }

    async search(req: Request) {
        return Api.searchShow(req.query);
    }

    async image(req: Request, res: Response) {
        const { ARTURL } = process.env;

        const { path } = req.params;
        const data = await Api.fetch(path, ARTURL, { responseType: 'arraybuffer' })
        res.writeHead(200, {
            'Content-Type': 'image/jpg',
            'Content-Length': data.length
        })
        res.end(data);
    }
}