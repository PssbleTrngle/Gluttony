import classes from 'classnames';
import React, { useEffect, useState } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import Api from '../api/Api';
import { useEvent, useLoading, useLoadingList } from '../api/Hooks';
import { IEpisode, IShow, IShowSearch } from '../api/Models';
import Cell from '../components/Cell';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { ART_URL } from '../config';

const Wrapper = () => {
    const { id } = useParams();
    const num = Number.parseInt(id);

    if (isNaN(num)) return <Search search={id} />;
    else return <Show id={num} />;
}

const Search = ({ search }: { search: string }) => {
    return useLoadingList<IShowSearch>('shows/search', { name: search, limit: 1 },
        result => <Redirect to={`/show/${result[0].id}`} />
    )
}

const Show = ({ id }: { id: number }) => {
    return useLoading<IShow>(`shows/${id}`, ({ id, seriesName, poster, banner }) =>
        <>
            <h1>{seriesName}</h1>
            <Episodes />
            {banner && <img className='banner' alt={seriesName} src={ART_URL + banner} />}
            <img className='poster' alt={seriesName} src={ART_URL + poster} />
        </>
    )
}

const Episodes = () => {
    const { id } = useParams();

    const [edit, setEdit] = useState(false);

    useEvent('keydown', e => {
        if (e.keyCode === 17) setEdit(true);
    });

    useEvent('keyup', e => {
        if (e.keyCode === 17) setEdit(false);
    });

    return <Cell area='episodes'>
        {useLoadingList<IEpisode>(`shows/${id}/episodes`, episodes => <LoadedEpisodes {...{ episodes, edit }} />)}
    </Cell>
}

const LoadedEpisodes = ({ episodes, edit }: { episodes: IEpisode[], edit: boolean }) => {

    const seasons = episodes.map(e => e.airedSeason).filter((s, i, a) => a.indexOf(s) === i);
    const [cached, setCached] = useState<number[]>([]);
    const showID = episodes[0].seriesId;
    const watched = cached.length >= episodes.length;

    useEffect(() => {
        setCached(episodes.filter(e => !!e.watched).map(e => e.id));
    }, [episodes])

    return <>
        <span
            onClick={() => {
                if (!watched) {
                    const missing = episodes
                        .filter(e => !cached.includes(e.id))
                        .map(episodeID => ({ episodeID, showID }));
                    Api.post('watched', missing, true)
                        .catch(e => console.error(e));
                    setCached(episodes.map(e => e.id));
                }
            }}
            role={watched ? undefined : 'button'}
            title={watched ? 'You have watched this show' : 'I watched this show'}>
            <Icon icon={faCheck} />
        </span>
        <Cell area='seasons'>
            {seasons.map(s =>
                <ul key={s}>
                    {episodes.filter(e => e.airedSeason === s).map(episode =>
                        <Episode
                            {...{ edit }}
                            {...episode}
                            key={episode.id}
                            watched={cached.includes(episode.id) as any}
                            select={until => {

                                const remove = until ? episodes
                                    .filter(e => cached.includes(e.id))
                                    .filter(e => e.airedEpisodeNumber > episode.airedEpisodeNumber) : [];

                                const add = until ? episodes
                                    .filter(e => !cached.includes(e.id))
                                    .filter(e => e.airedEpisodeNumber < episode.airedEpisodeNumber)
                                    .map(e => e.id) : [];

                                if (!episode.watched) add.push(episode.id);
                                else if (!until) remove.push(episode);

                                setCached(w => [...w.filter(i => !remove.find(e => i === e.id)), ...add]);

                                return Promise.all([
                                    Api.delete('watched', { ids: remove.map(e => e.watched?.id) }),
                                    Api.post('watched', add.map(episodeID => ({ episodeID, showID }))),
                                ]);
                            }} />
                    )}
                </ul>
            )}
        </Cell>
    </>;
}

const Episode = (props: IEpisode & { edit: boolean, select: (until: boolean) => Promise<any> }) => {
    const { episodeName, airedEpisodeNumber, watched, edit, select } = props;

    /*
    const [emulatedWatched, emulateWatched] = useState<boolean>(!!watched);
    useEffect(() => {
        emulateWatched(!!watched);
    }, [watched]);
    */

    const click = (e: React.MouseEvent) => {
        if (edit) select(e.shiftKey).catch(e => console.error(e))
    }

    return <li
        onClick={click}
        className={classes({ watched, edit })}
        title={episodeName}>
        {airedEpisodeNumber}
    </li>
}

export default Wrapper;