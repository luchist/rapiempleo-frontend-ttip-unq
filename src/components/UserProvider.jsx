import {createContext, useState, useCallback, useMemo} from "react";

const UserContext = createContext()

function UserProvider ({children}) {
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem("user");
        if (!stored) { return undefined; }
        return JSON.parse(stored);
    })
    const [isLogged, setIsLogged] = useState(() => localStorage.getItem("user") !== null)

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