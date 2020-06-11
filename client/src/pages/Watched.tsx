import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLoadingList, useApiList } from '../api/Hooks';
import { IShow } from '../api/Models';
import { ART_URL } from '../config';
import classes from 'classnames';

type IWatchedShow = IShow & { count: number };

const Watched = () => {
    const watched = useLoadingList<IWatchedShow>('shows/watched', watched =>
        watched.map(show =>
            <Show {...show} key={show.id} />
        )
    )

    return <div className='covers'>{watched}</div>;
}

const Show = ({ seriesName, id, poster, count }: IWatchedShow) => {
    const [episodes] = useApiList(`shows/${id}/episodes`);

    const progress = useMemo(() => Math.min(episodes ? (count / episodes.length * 100) : 0, 100), [episodes, count]);
    const done = progress >= 100;

    return <Link to={`/show/${id}`}>
        <img title={seriesName} alt={seriesName} src={ART_URL + poster} />
        <div className={classes('progress', { done })} style={{ width: `${progress}%` }} />
        {/*<span className='percentage'>{progress}%</span>*/}
    </Link>
}

export default Watched;