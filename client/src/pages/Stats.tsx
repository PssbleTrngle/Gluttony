import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState, useMemo } from 'react';
import API from '../api/Api';
import { useApi, useApiList } from '../api/Hooks';
import { IStat, IWatched } from '../api/Models';
import { faRedoAlt, faInfo, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import classes from 'classnames';

interface IDisplayedStat {
    total?: number;
    value?: number;
    text?: string;
    locked?: boolean
    refresh?: () => {};
}

const Stats = () => {
    const [showsWatched] = useApiList<IWatched>('shows/watched');
    const [episodesWatched] = useApi<{ count: number }>('watched/count');
    const [time] = useApi<IStat>('stats/time', { calculate: true });
    const [episodes] = useApi<IStat>('stats/episodes', { calculate: true });

    const birth = new Date('July 17, 1999');
    const now = new Date();
    const livedFor = (now.getTime() - birth.getTime()) / 6000;

    const refresh = (stat: string) => API.post(`stats/${stat}`).catch(e => console.error(e));

    const stats: IDisplayedStat[] = [
        { text: 'shows watched', value: showsWatched?.length },
        { text: 'episodes watched', value: episodesWatched?.count },
        { text: 'minutes wasted', ...time, refresh: () => refresh('time') },
        { text: 'minutes of your life wasted', total: livedFor, value: time?.value },
        { text: 'watched', total: episodes?.value, locked: episodes?.locked, value: episodesWatched?.count, refresh: () => refresh('episodes') },
    ]

    return <>{stats.map((s, i) =>
        <Stat key={s.text ?? i} {...s} />
    )}</>
}

const Stat = (props: IDisplayedStat) => {
    const { total, locked, refresh } = props;

    const inner = (() => {
        if (total) return <Pie {...props} {...{ total }} />
        else return <BigNumber {...props} />
    })();

    return <div className={classes('stat', { locked })}>
        {inner}
        {refresh && <button onClick={locked ? undefined : refresh}>
            <Icon title={locked ? 'Calculating' : 'Recalculate'} icon={locked ? faInfoCircle : faRedoAlt} />
        </button>}
    </div>;
}

const Pie = (props: { total: number } & IDisplayedStat) => {
    const { total, value } = props;
    const [loaded, load] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => load(true), 100);
        return () => window.clearTimeout(t);
    });

    const size = 300;
    const radius = size / 3;
    const circumference = 2 * 3.14 * radius;
    const p = (value ?? 0) / total;
    const strokeLength = loaded ? circumference * p : 0;

    const percentage = useMemo(() => {
        const s = (p * 100).toFixed(4);
        const match = s.match(/([0.]*)(.*)/);
        const [, leading, trailing] = match ?? [];

        if (!match || trailing.length > 2) return Math.round(p * 100);

        return <>
            <span className='small'>{leading}</span>
            <span>{trailing}</span>
        </>
    }, [p])

    return <>
        <p className='centered'>{percentage}%</p>
        <svg className='pie' viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
            {[false, true].map((p, i) =>
                <circle
                    key={i}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill='none'
                    stroke={p ? '#FFF4' : '#FFF1'}
                    strokeWidth={p ? 20 : 16}
                    strokeDasharray={p ? `${strokeLength},${circumference}` : ''}
                    strokeLinecap='round'
                />
            )}
        </svg>
    </>
}

const BigNumber = (props: IDisplayedStat) => {
    const { value, text } = props;
    const length = value?.toString().length ?? 2;
    const [obfuscated, setObfuscated] = useState<string | null>('');
    const [, increment] = useState(0);

    const c = '01234567890'.split('');

    useEffect(() => {
        increment(0);
        const interval = setInterval(() => {
            increment(i => {

                const l = Math.floor(i / 10) + 1;
                const rc = () => c.sort(() => Math.random() - 0.5).slice(0, l).join('').padEnd(length, '_');

                if (l > length) {
                    setObfuscated(null);
                    return i;
                } else {
                    setObfuscated(rc());
                    return i + 1;
                }
            });
        }, 100 / length);
        return () => clearInterval(interval);
    }, [value])

    return <>
        <p className='obfuscated big'>{obfuscated ?? value ?? '??'}</p>
        {text && <p>{text}</p>}
    </>
}

export default Stats;