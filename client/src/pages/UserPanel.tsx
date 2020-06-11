import React from 'react';
import { useApi, useLoading } from '../api/Hooks';
import { IUser } from '../api/Models';

const UserPanel = () => {
    const [user] = useApi<IUser>('user');
    if (!user) return <p className='empty-info'>You are not logged in</p>
    return <>
        <h1 className='center'>Welcome {user.username}!</h1>
        <Debug />
    </>
}

const Debug = () => {
    return useLoading('shows/320724', r => <p>{JSON.stringify(r)}</p>);
}

export default UserPanel;