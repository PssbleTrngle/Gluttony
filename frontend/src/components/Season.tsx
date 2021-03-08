import { FC } from 'react';
import { useFetch } from '../api/hooks';
import { ISeason } from '../api/models';

const Season: FC<ISeason> = ({ id, number }) => {
   const [season] = useFetch(`season/${id}`)

   if (season) return <Episodes {...season} />
   else return <p>Season {number}</p>
}

const Episodes: FC<any> = props => {
   return <pre>{JSON.stringify(props, null, 2)}</pre>
}

export default Season