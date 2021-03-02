import { AuthRequest } from "..";
import Watched from '../models/Watched'
import Api, { validEpisode } from "../Api";
import { debug } from "../logging";
import ResourceController from "./ResourceController";
import e from "express";

export default class WatchedController {

    async import(req: AuthRequest) {
        const { show: slug, episodes, season, release, name: n } = req.body;

        const name = n ?? slug.replace('-', ' ')

        const shows = await Api.searchShow({ name })
            .catch(() => Api.searchShow({ slug }));

        const date = new Date(release);

        const sorted = shows.filter(s => {
            const d = new Date(s.firstAired);
            return d.getFullYear() === date.getFullYear();
        });

        const show = sorted[0];

        if (show) {
            const all = await Api.getShowEpisodes(show.id);
            const forSeason = all
                .filter(validEpisode)
                .filter(e => e.airedSeason === season);

            const watched = forSeason.filter((_, i) => episodes.includes(i + 1));

            const values: any[] = watched.map(e => ({ episodeID: e.id, user: req.user, showID: show.id }));
            const [sql, args] = Watched
                .createQueryBuilder()
                .insert()
                .values(values)
                .getQueryAndParameters();
            const nsql = sql.replace('INSERT INTO', 'INSERT OR IGNORE INTO')

            await Watched.query(nsql, args)

            return 201;
        }

        return null;
    }

}