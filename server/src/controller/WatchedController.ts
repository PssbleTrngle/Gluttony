import { AuthRequest } from "..";
import Watched from '../models/Watched'
import ApiController from "./ApiController";
import { debug } from "../logging";

export default class WatchedController {

    async shows(req: AuthRequest) {

        const watched: any[] = await Watched.createQueryBuilder()
            .groupBy('showID')
            .select('showID')
            .addSelect('COUNT(*) AS count')
            .getRawMany();

        return Promise.all(watched.map(({ showID, count }) =>
            ApiController.getShow(showID).then(s => ({ ...s, count }))
        ))
    }

}