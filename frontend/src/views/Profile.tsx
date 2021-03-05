/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { DateTime } from 'luxon';
import { transparentize } from 'polished';
import { FC } from "react";
import { useSubmit, useUser } from "../api/hooks";
import { IUser } from "../api/models";
import { LinkButton } from '../components/Link';
import { Title } from '../components/Text';

const Profile: FC = () => {
   const user = useUser()

   return <>
      <Title>You Profile</Title>
      {user
         ? <Info {...user} />
         : <p>Not logged in</p>
      }
   </>
}

const Info: FC<IUser> = ({ timestamps, username, email, emailVerified }) => {
   const created = DateTime.fromISO(timestamps.created)

   const style = css`
      display: grid;
      margin: 0 auto;
      max-width: 800px;
      text-align: center;
      gap: 2rem;
      grid-template:
         	"a a"
            "b c"
            "d e"
            / 1fr 1fr;

      & > :first-of-type {
         grid-area: a;
      }
   `

   const reset = useSubmit('auth/reset')

   return <div css={style}>
      <Panel>
         <label>Username</label>
         <p>{username}</p>
      </Panel>

      <Panel>
         <label>E-Mail</label>
         <p>{email}</p>
      </Panel>

      <Panel>
         <label>Password</label>
         <p>***********</p>
         <LinkButton
            title={emailVerified ? undefined : 'You need a verified email to reset your password'}
            disabled={!emailVerified} onClick={reset.send}>
            Reset password
         </LinkButton>
      </Panel>

      <Panel>
         <label>Joined at</label>
         <p>{created.toLocaleString()} ({created.toRelative()})</p>
      </Panel>

   </div>
}

const Panel = styled.div`
   display: grid;
   gap: 0.5rem;
   padding: 1rem;
   border-radius: 10px;
   background: ${p => transparentize(0.9, p.theme.secondary)};
`

export default Profile