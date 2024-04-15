import React, {useContext} from 'react'
import { Link } from 'react-router-dom'
import AuthContext from './context/AuthContext'


export default function Login(){
    let {loginUser} = useContext(AuthContext)
    let {user} =useContext(AuthContext)
    let {logoutUser} = useContext(AuthContext)
    return(
        <>
            

            {user ? <div className="welcome-login flex-col"><h1>Hello, {user.username}</h1> <button className='btn-logout' onClick={logoutUser}>Logout</button>
            
            
            <Link to ={'/upload'} className='btn-sell'> <button >Sell an Item</button></Link>
            </div>
            
            
            
            :  <><h1 className='signup-header'> Login</h1> <form className='login-form' onSubmit={loginUser}>
                <input type="text" name="username" id="username" placeholder='Enter User Name' />
                <input type="password" name="password" id="password" placeholder='Enter Password'/>
                <input type="submit" className='login-submit' value="Login" /><h3>Don't Have an account? <Link to={'/signup'}>Sign Up</Link> </h3>
            </form></>}
            
        </>
    )
}