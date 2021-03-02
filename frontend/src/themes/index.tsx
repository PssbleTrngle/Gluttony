import { css, CSSInterpolation } from '@emotion/css'
import { createContext, Dispatch, FC, SetStateAction, useContext, useMemo, useState } from 'react'

export interface Theme {
   bg: string
   primary: string
   secondary: string
   text: string
}

const themes = new Map<string, Theme>()

export function createTheme(key: string, theme: Theme) {
   themes.set(key, theme)
}

export function getTheme(key: string) {
   const theme = themes.get(key)
   if (theme) return theme
   else throw new Error(`Theme '${key}' not found`)
}

export function getThemes() {
   return themes.keys()
}

require("./dark")

export const DEFAULT = getTheme('dark')

const ThemeContext = createContext<[Theme, Dispatch<SetStateAction<Theme>>]>([DEFAULT, () => { }])

export function useTheme() {
   return useContext(ThemeContext)
}

export function useStyles(style: (t: Theme) => CSSInterpolation) {
   const [theme] = useTheme()
   return useMemo(() => css(style(theme)), [theme, style])
}

export const ThemeProvider: FC = ({ children }) => {
   const saved = localStorage.getItem('theme')
   const initial = getTheme((saved && themes.has(saved)) ? saved : 'dark')
   const theme = useState(initial)

   return <ThemeContext.Provider value={theme}>
      {children}
   </ThemeContext.Provider>
}