import { createContext, useState, useEffect } from "react"; 

import { jwtDecode } from "jwt-decode";
import {useNavigate} from "react-router-dom"



const AuthContext = createContext()

export default AuthContext;

export const AuthProvider = ({children}) => {
  
    
    let [authTokens, setAuthTokens] = useState(()=> localStorage.getItem('authTokens') ? JSON.parse( localStorage.getItem('authTokens')):null)
    let [user, setUser] = useState(()=> localStorage.getItem('authTokens') ? jwtDecode( localStorage.getItem('authTokens')):null)
    let [loading, setIsLoading] = useState(true)
    let loginUser = async (e) => {
        e.preventDefault();
        try {
            let response = await fetch('http://127.0.0.1:8000/api/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'username': e.target.username.value,
                    'password': e.target.password.value
                })
            });
    
            if (!response.ok) {
                throw new Error('Failed to login'); 
            }
    
            let data = await response.json(); 
            console.log('data', data); 
            localStorage.setItem('authTokens', JSON.stringify(data))
            setAuthTokens(data)
            setUser(jwtDecode(data.access))
            
        } catch (error) {
            console.error('Error:', error.message);
            
        }
    }
    let logoutUser =()=>{
        setAuthTokens(null)
        setUser(null)
        localStorage.removeItem('authTokens')
    }

    let updateToken = async ()=> {
        console.log('updated?')
        let response = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'refresh':authTokens.refresh
            })
        });


        const data = await response.json()
        if (response.ok){
            setAuthTokens(data)
            setUser(jwtDecode(data.access))
            localStorage.setItem('authTokens', JSON.stringify(data))
        }else{
            logoutUser()
        }
        

    }
  
    let contextData = {
        user:user,
        loginUser:loginUser,
        logoutUser:logoutUser
        
    }
    useEffect(() => {
        let fourMin = 1000 * 60 * 4
        let interval = setInterval(() =>{
            if(authTokens){
                updateToken()
            }
        },fourMin)
        return ()=> clearInterval(interval)

    }, [authTokens, loading])


    return(
         <AuthContext.Provider value={contextData}>
            {children}
         </AuthContext.Provider>
    )
   

}