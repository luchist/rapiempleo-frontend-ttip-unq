import { createContext, useState, useEffect, useCallback, useMemo } from "react";

const ThemeContext = createContext()

// Defaults to the app's original dark look when no preference is stored.
const loadStoredTheme = () => {
    const stored = localStorage.getItem("theme")
    return stored === "light" || stored === "dark" ? stored : "dark"
}

function ThemeProvider ({children}) {
    const [theme, setTheme] = useState(loadStoredTheme)

    // Reflect the current theme on <html> so the CSS token overrides apply,
    // and persist the choice (write-through, mirroring UserProvider).
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme)
        localStorage.setItem("theme", theme)
    }, [theme])

    const toggleTheme = useCallback(() => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"))
    }, [])

    const contextValue = useMemo(() => ({
        theme,
        toggleTheme
    }),
    [theme, toggleTheme])

    return(
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    )
}

export default ThemeContext
export { ThemeProvider }
