import {createContext, useState, useCallback, useMemo, useEffect} from "react";

const UserContext = createContext()

function UserProvider ({children}) {
    const [user, setUser] = useState()
    const [isLogged, setIsLogged] = useState(false)

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            setUser(JSON.parse(storedUser));
            //setIsLogged(true);
        }
    }, []);

    const setAuth = useCallback((userData) => {
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
    })

    const changeLogin = useCallback(() => {
        const logged = !isLogged
        setIsLogged(logged)
    },[isLogged])

    //const auth = useCallback(() => { return localStorage.getItem('Authorization')},[])

    const contextValue = useMemo(() => ({
        user,
        isLogged,
        setAuth,
        changeLogin
    }),
    [user, isLogged, changeLogin, setAuth])

    return(
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    )

}

export default UserContext
export { UserProvider }