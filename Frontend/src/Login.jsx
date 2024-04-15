import React, {useContext} from 'react'
import { Link } from 'react-router-dom'
import AuthContext from './context/AuthContext'


export default function Login(){
    let {loginUser} = useContext(AuthContext)
    let {user} =useContext(AuthContext)
    let {logoutUser} = useContext(AuthContext)
    return(
        <>
            

            {user ? <><p>Hello, {user.username}</p> <button onClick={logoutUser}>Logout</button>
            
            
            <Link to ={'/upload'}> <button>Sell an Item</button></Link>
            </> 
            
            
            
            : <form onSubmit={loginUser}>
                <input type="text" name="username" id="username" placeholder='Enter User Name' />
                <input type="password" name="password" id="password" placeholder='Enter Password'/>
                <input type="submit" value="" /><h3>Don't Have an account? <Link to={'/signup'}>Sign Up</Link> </h3>
            </form>}
            
        </>
    )
}