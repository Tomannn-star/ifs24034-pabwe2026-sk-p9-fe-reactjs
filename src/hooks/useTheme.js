import { useState, useEffect, useCallback } from 'react'

const THEME_KEY = 'delcom_blog_theme'

export const useTheme = () => {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved) return saved
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme === 'dark' ? 'dark' : 'light')
  }, [])

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
  }
}

export default useTheme
