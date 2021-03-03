/** @jsxImportSource @emotion/react */
import { css } from '@emotion/css';
import { DateTime } from 'luxon';
import { FC } from "react";
import { useApi, useSubmit } from "../api/hooks";
import { IToken } from "../api/models";
import { Button } from '../components/Inputs';
import { useStyles } from '../themes';

const Tokens: FC = () => {
   const [tokens] = useApi<IToken[]>('token')

   const style = css`
      padding: 10px;
      margin: 0 auto;
   `

   return <ul className={style}>
      {tokens?.map(token =>
         <Token key={token.id} {...token} />
      )}
   </ul>
}

const Token: FC<IToken> = ({ id, reason, timestamps, active }) => {

   const style = useStyles(({ text, primary, secondary }) => ({
      label: `color: ${active ? primary : text}`,
      item: `
         padding: 20px;
         display: grid;
         grid-template-columns: 2fr 1fr 1fr;
         gap: 10px;
         align-items: center;
         transition: background 0.1s linear;

         &:hover {
            background: lighten(${secondary}, 0.4);
         }

         &:not(:last-child) {
            border-bottom: 1px solid #FFF2;
         }
      `,
   }))

   const remove = useSubmit(`token/${id}`, {}, 'DELETE')

   return <li css={style.item}>
      <span css={style.label}>{reason}</span>
      <span>{DateTime.fromISO(timestamps.created).toRelative()}</span>
      <Button disabled={active} onClick={remove.send}>
         {active ? 'In use' : 'Invalidate'}
      </Button>
   </li>
}

export default Tokens