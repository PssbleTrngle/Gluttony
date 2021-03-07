/** @jsxImportSource @emotion/react */
import { css, Theme } from "@emotion/react";
import styled from "@emotion/styled";

const style = (p: { theme: Theme }) => css`
   color: ${p.theme.link.default};
   
   :visited {
      color: ${p.theme.link.visited};
   }

   :disabled {
      color: #AAA;
      cursor: not-allowed;
   }
`

export const Link = styled.link`
   ${style}
`

export const LinkButton = styled.button`
   ${style}
   text-decoration: underline;
   outline: none;
`