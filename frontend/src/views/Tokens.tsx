/** @jsxImportSource @emotion/react */
import { css, Theme } from '@emotion/react';
import styled from '@emotion/styled';
import { DateTime } from 'luxon';
import { transparentize } from "polished";
import { FC, Fragment } from "react";
import { useApi, useSubmit } from "../api/hooks";
import { IToken } from "../api/models";
import { Button } from '../components/Inputs';
import { Title } from '../components/Text';

const Tokens: FC = () => {
   const [tokens] = useApi<IToken[]>('token')

   const style = css`
      padding: 10px;
      margin: 0 auto;
   `

   return <>
      <Title>Your logins</Title>
      <ul css={style}>
         {tokens?.map((token, i) =>
            <Fragment key={token.id}>
               <Token  {...token} />
               {i < tokens.length - 1 &&
                  <Line />
               }
            </Fragment>
         )}
      </ul>
   </>
}

const Token: FC<IToken> = ({ id, reason, timestamps, active }) => {

   const style = (t: Theme) => css`
      padding: 1rem;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
         
      gap: 10px;
      align-items: center;
      transition: background 0.1s linear;
      border-radius: 20px;

      &:hover {
         background: ${transparentize(0.9, t.secondary)};
      }
   `

   const remove = useSubmit(`token/${id}`, {}, 'DELETE')

   return <li css={style}>
      <span>{reason}</span>
      <span>{DateTime.fromISO(timestamps.created).toRelative()}</span>
      <Button disabled={active} onClick={remove.send}>
         {active ? 'In use' : 'Invalidate'}
      </Button>
   </li>
}

const Line = styled.div`
   border-bottom: 1px solid ${p => transparentize(0.5, p.theme.secondary)};
   margin: 0.6rem 1rem;
`

export default Tokens