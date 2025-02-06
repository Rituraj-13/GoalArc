import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext({
  theme: "blue",
  setTheme: () => null,
  isDark: false,
  setIsDark: () => null,
  isCollapsed: false,
  setIsCollapsed: () => null,
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("blue")
  const [isDark, setIsDark] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.toggle("dark", isDark)
  }, [isDark])

  useEffect(() => {
    // Load saved preferences
    const savedTheme = localStorage.getItem('theme') || 'blue'
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    const savedCollapsed = localStorage.getItem('sidebarCollapsed') === 'true'
    
    setTheme(savedTheme)
    setIsDark(savedDarkMode)
    setIsCollapsed(savedCollapsed)
  }, [])

  useEffect(() => {
    // Save preferences
    localStorage.setItem('theme', theme)
    localStorage.setItem('darkMode', isDark)
    localStorage.setItem('sidebarCollapsed', isCollapsed)
  }, [theme, isDark, isCollapsed])

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      isDark,
      setIsDark,
      isCollapsed,
      setIsCollapsed
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
} 