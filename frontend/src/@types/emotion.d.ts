import '@emotion/react';

declare module '@emotion/react' {
   interface Theme {
      bg: string
      primary: string
      secondary: string
      text: string
      link: {
         default: string
         visited: string
      }
   }
}