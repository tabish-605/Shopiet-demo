import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    let [authTokens, setAuthTokens] = useState(() => JSON.parse(localStorage.getItem('authTokens')) || null);
    let [user, setUser] = useState(() => authTokens ? jwtDecode(authTokens.access) : null);
    let [loading, setLoading] = useState(true);

    const loginUser = async (e) => {

        console.log(e.username)
        console.log(e.password)
    
        try {
            let response = await fetch('https://shopietbackend-wlzwbcznba-bq.a.run.app/api/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'username': e.username,
                    'password': e.password
                })
            });

            if (!response.ok) {
                throw new Error('Failed to login');
            }
         
            let data = await response.json();
            console.log(JSON.stringify(data))
            

            
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
            localStorage.setItem('authTokens', JSON.stringify(data));
            
            console.log(JSON.stringify(data))
            console.log('dat is this:' + JSON.stringify(data))
            
        } catch (error) {
            console.error('Error:', error.message);
        }
    };

    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
    };

    const updateToken = async () => {
        try {
            let response = await fetch('https://shopietbackend-wlzwbcznba-bq.a.run.app/api/token/refresh/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'refresh': authTokens.refresh
                })
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            let data = await response.json();
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
            localStorage.setItem('authTokens', JSON.stringify(data));
        } catch (error) {
            console.error('Error:', error.message);
            logoutUser();
        }
    };

    useEffect(() => {
        const fourMinutes = 1000 * 60 * 4;
        const interval = setInterval(() => {
            if (authTokens) {
                updateToken();
            }
        }, fourMinutes);

        return () => clearInterval(interval);
    }, [authTokens]);

    const contextData = {
        user,
        authTokens,
        loginUser,
        logoutUser,
        loading
    };

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};
