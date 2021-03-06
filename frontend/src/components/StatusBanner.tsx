import { css } from '@emotion/css';
import { FC, useMemo } from 'react';
import { AppStatus } from '../api/models';
import { useStatus } from '../api/status';

const colors: Record<AppStatus, string> = {
   [AppStatus.LOGGED_IN]: '#74cc39',
   [AppStatus.LOGGED_OUT]: '#d1b62e',
   [AppStatus.OFFLINE]: '#222',
   [AppStatus.LOADING]: '#777',
}

const StatusBanner: FC = () => {

   const [status] = useStatus()

   const style = useMemo(() => css`
      background: ${colors[status]};
      padding: 0.7rem;
      text-align: center;
   `, [status])

   return <div className={style}>
      {status}
   </div>
}

export default StatusBanner