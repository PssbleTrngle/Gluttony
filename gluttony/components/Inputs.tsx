import styled from "@emotion/styled";

interface ButtonProps {
   square?: boolean
   secondary?: boolean
}
export const Button = styled.button<ButtonProps>`
   padding: 0.4rem;
   border-radius: ${p => p.square ? undefined : '999px'};
   background: ${p => p.theme.primary};

   &:disabled {
      background: #444;
      color: #CCC;
   }
`