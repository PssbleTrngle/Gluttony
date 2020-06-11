import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLoadingList, useEvent } from '../api/Hooks';
import { IShowSearch } from '../api/Models';
import Cell from './Cell';

const SearchBar = () => {
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLInputElement>(null);

    useEvent('keydown', e => {
        if (e.keyCode === 70 && e.ctrlKey) {
            ref.current?.focus();
            e.preventDefault();
        }
    })

    return <Cell area='searchbar'>
        <input
            onKeyDown={e => {
                if (e.keyCode === 27) ref.current?.blur();
            }}
            placeholder='Search for shows'
            className='big'
            type='text'
            autoComplete='false'
            value={search}
            onChange={e => setSearch(e.target.value)}
            {...{ ref }}
        />
        {search.length > 0 && <Results {...{ search }} />}
    </Cell>
}

const Results = ({ search }: { search: string }) => {
    const results = useLoadingList<IShowSearch>('shows/search', { name: search.trim(), limit: 5 },
        r => r.map(({ seriesName, id }) =>
            <Link key={id} to={`/show/${id}`}>
                <li>{seriesName}</li>
            </Link>
        )
    );

    return <ul className='results'>
        {results}
    </ul>;
}

export default SearchBar;