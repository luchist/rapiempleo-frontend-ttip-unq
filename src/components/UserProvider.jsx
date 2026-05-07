import {createContext, useState, useCallback, useMemo} from "react";

const UserContext = createContext()

function UserProvider ({children}) {
    const [user, setUser] = useState()
    const [isLogged, setIsLogged] = useState(false)
    /*
    const setAuth = useCallback((auth) => {
        localStorage.setItem('Authorization', auth)
    },[])
    */
    const setAuth = useCallback((userData) => {
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
    })

    const changeLogin = useCallback(() => {
        const logged = !isLogged
        setIsLogged(logged)
    },[isLogged])

    const auth = useCallback(() => { return localStorage.getItem('Authorization')},[])

    const contextValue = useMemo(() => ({
        user,
        isLogged,
        setAuth,
        changeLogin
    }),
    [isLogged, changeLogin, auth, setAuth])

    return(
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    )

}

export default UserContext
export { UserProvider }