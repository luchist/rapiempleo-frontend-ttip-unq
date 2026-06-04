import {createContext, useState, useCallback, useMemo} from "react";

const UserContext = createContext()

const loadStoredUser = () => {
    const stored = localStorage.getItem("user")
    if (!stored) return undefined
    try {
        return JSON.parse(stored)
    } catch {
        localStorage.removeItem("user")
        return undefined
    }
}

function UserProvider ({children}) {
    const [user, setUser] = useState(loadStoredUser)
    const [isLogged, setIsLogged] = useState(() => loadStoredUser() !== undefined)

    const setAuth = useCallback((userData) => {
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
    }, [])

    const changeLogin = useCallback(() => {
        const logged = !isLogged
        setIsLogged(logged)
    },[isLogged])

    const contextValue = useMemo(() => ({
        user,
        isLogged,
        setAuth,
        changeLogin,
        setUser
    }),
    [user, isLogged, changeLogin, setAuth, setUser])

    return(
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    )

}

export default UserContext
export { UserProvider }