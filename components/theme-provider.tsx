"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export const useTheme = () => {
  const { theme, setTheme } = React.useContext(
    // @ts-ignore - 타입 오류 무시
    React.createContext({ theme: undefined, setTheme: () => {} }),
  )

  return { theme, setTheme }
}
