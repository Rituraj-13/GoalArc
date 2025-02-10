import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext({
  isDark: false,
  setIsDark: () => null,
  isCollapsed: false,
  setIsCollapsed: () => null,
});

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.toggle("dark", isDark)
  }, [isDark])

  useEffect(() => {
    // Load saved preferences
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    const savedCollapsed = localStorage.getItem('sidebarCollapsed') === 'true'
    
    setIsDark(savedDarkMode)
    setIsCollapsed(savedCollapsed)
  }, [])

  // Update localStorage whenever isCollapsed changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed.toString())
  }, [isCollapsed])

  // Update localStorage whenever isDark changes
  useEffect(() => {
    localStorage.setItem('darkMode', isDark.toString())
  }, [isDark])

  return (
    <ThemeContext.Provider value={{
      isDark,
      setIsDark,
      isCollapsed,
      setIsCollapsed,
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