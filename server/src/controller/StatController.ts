import { AuthRequest } from "..";
import Api from "../Api";
import { error, warn } from "../logging";
import Stat from "../models/Stat";
import User from "../models/User";
import Watched from "../models/Watched";
import { HttpError } from "./ResourceController";

export type Calculator = (user: User, ...set: ((v: number) => Promise<any>)[]) => Promise<any>;
function exists<T>(t: T | null | undefined | void): t is T {
    return t !== void 0 && t !== null && t !== undefined;
}

export default class StatController {

    private static calculators: { calc: Calculator, names: string[] }[] = [];

    static register(calc: Calculator, ...names: string[]) {
        this.calculators.push({ calc, names });
    }

    static async calculate(name: string, user: User) {
        const calc = this.calculators.find(({ names }) => names.includes(name));

        if (!calc) throw new HttpError(404);

        const all = await Promise.all(calc.names.map(async name => {
            //@ts-ignore
            const stat: Stat = await Stat.findOne({ where: { user, name } }) ?? await Stat.create({ user, name });
            return stat;
        }))

        const stats = await Promise.all(all.filter(s => !s.locked).map(stat => {
            stat.locked = true;
            return stat.save();
        }));

        const required = stats.find(s => s.name === name);

        if (!required) throw new HttpError(400, 'Stat is being calculated')

        const set = calc.names.map((_, i) => async (v: number) => {
            stats[i].locked = false;
            stats[i].value = v;
            await stats[i].save();
        })

        await calc.calc(user, ...set).catch(() => error(`Calculation for ${name} encountered error`));

        await Promise.all(stats.map(async s => {
            if (s.locked) {
                warn(`Calculator for ${name} did not calculate value for ${s.name} as claimed`);
                s.locked = false;
                await s.save();
            }
        }));

        await required.reload();
        return required;
    }

    async calculate(req: AuthRequest) {
        const name = req.params.name.toLowerCase();
        return await StatController.calculate(name, req.user);
    }

    async value(req: AuthRequest) {
        const name = req.params.name.toLowerCase();

        const stat = await Stat.findOne({ where: { name, user: req.user } });
        if (stat) {
            const passed = new Date().getTime() - stat.timestamps.updated.getTime();
            if (stat.locked && passed > 1000 * 60 * 5) {
                warn(`Calculation for ${name} seems to have taken to long`);
                stat.locked = false;
                await stat.save();
            }
            return stat;
        }

        if (req.query.calculate === 'true') {
            return await StatController.calculate(name, req.user);
        }

        return null;
    }

}

StatController.register(async (user, setTime) => {

    const watched = await Watched.find({ where: { user } });

    /*
    const episodes = await Promise.all(watched.map(({ episodeID }) => ApiController.getEpisode(episodeID)
        .then(e => Number.parseInt(e.runtime))
        .catch(() => 0)
    ));
    const total = episodes.reduce((t, runtime) => t + runtime, 0);
    */

    const counts = new Map<number, number>();

    watched
        .map(w => w.showID)
        .forEach(id => counts.set(id, (counts.get(id) ?? 0) + 1));

    const shows = await Promise.all(Array.from(counts.keys())
        .map(id => Api.getShow(id)
            .then(show => ({ count: counts.get(id) ?? 0, show }))
            .catch(() => null)
        ));

    const total = shows.filter(exists).reduce((t, { show, count }) => t + Number.parseInt(show.runtime) * count, 0);

    await setTime(total);

}, 'time');

StatController.register(async (user, setEpisodes) => {

    const watched = await Watched.find({ where: { user } });

    const shows = await Promise.all(watched
        .map(w => w.showID)
        .filter((s, i, a) => a.indexOf(s) === i)
        .map(showID => Api.getShowEpisodes(showID).catch(() => []))
    );

    const episodes = shows.reduce((t, s) => t + s.length, 0);

    await setEpisodes(episodes);

}, 'episodes');