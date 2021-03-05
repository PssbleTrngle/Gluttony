import { css, Theme, ThemeProvider as EmotionThemeProvider, useTheme } from '@emotion/react'
import { FC, useMemo, useState } from 'react'
import dark from './dark'

const themes: Record<string, Partial<Theme> | undefined> = { dark }

export const ThemeProvider: FC = ({ children }) => {
   const saved = localStorage.getItem('theme')
   const [theme] = useState(themes[saved ?? ''] ?? {})

   return <EmotionThemeProvider theme={dark} >
      <EmotionThemeProvider theme={def => ({ ...def, ...theme })} >
         {children}
      </EmotionThemeProvider>
   </EmotionThemeProvider>
}

type V = string | undefined
export function useStyle(template: TemplateStringsArray, ...args: Array<V | ((t: Theme) => V)>) {
   const theme = useTheme()
   return useMemo(() => css(
         template, ...args.map(a => 
            typeof a === 'string' ? a : a?.(theme)   
         )
   ), [theme, template, args])
}

/*
export function useStyles<K extends string>(styles: (t: Theme) => Record<K, CSSInterpolation>) {
   const theme = useTheme()
   return useMemo(() => Object.entries(styles(theme)).reduce(
      (o, [key, style]) => ({ ...o, [key]: css(style as SerializedStyles) }), {} as Record<K, string>
   ), [theme, styles])
}
*/