/** @jsxImportSource @emotion/react */
import { ButtonHTMLAttributes, FC } from "react";
import { useStyle } from "../themes";

export const Button: FC<ButtonHTMLAttributes<HTMLButtonElement> & {
   secondary?: boolean
   square?: boolean
}> = ({ children, secondary, square, ...props }) => {

   const style = useStyle(({ primary }) => `
      padding: 0.4rem;
      border-radius: ${square ? undefined : '999px'};
      background: ${primary};

      &:disabled {
         background: #444;
         color: #CCC;
      }
   `)

   return <button css={style} {...props}>
      {children}
   </button>

}