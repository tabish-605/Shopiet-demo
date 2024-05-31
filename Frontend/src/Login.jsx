import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from './context/AuthContext';
import authimg from './assets/login.svg'
import logimg from './assets/logged.svg'

export default function Login() {
   
    const { loginUser, user, logoutUser } = useContext(AuthContext);
    const [message, setMessage] = useState(null); 
    const [error, setError] = useState(false); 
    const [loading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        setMessage(null);   
        setError(false); 
        setIsLoading(true)

        e.preventDefault();
        const formData = {
            username: e.target.username.value,
            password: e.target.password.value
        };
        try {
            
            await loginUser(formData);
            if (user === null) {
                setMessage('Login failed, check username or credentials');
                setError(true);
                setIsLoading(false)
            } else {
                setMessage('Login successful'); 
            }
        } catch (error) {
            setIsLoading(false)
            if (error.response) {
                
                setMessage('Login failed. Please check your credentials.');
                setError(true); 
            } else if (error.request) {
            
                setMessage('Network error occurred. Please check your internet connection.');
                setError(true);
            } else {
                
                setMessage('An unexpected error occurred. Please try again later.');
                setError(true);
            }
        } finally{
            setIsLoading(false)
            
        }
    };

    return (
        <> 
            {
                user ? (
                    <div className="welcome-login flex-col">
                        <div className="eimg-cnt">
                        <img loading='eager' src={logimg}  className="auth-image" /></div>
                       
                <>
                        <h1>Hello, {user.username}</h1>
                       
                        <Link to='/update-profile' className='btn-sell profile'><button>Complete Profile</button></Link>
                        <Link to='/upload' className='btn-sell'><button>Sell an Item</button></Link>
                       <Link to ='/' className='btn-sell' > <button >Continue Browsing</button></Link>
                        <button className='btn-logout' onClick={logoutUser} >Log Out</button>
                    </></div>
                ) : (
                    <>
                        
                        <form className='login-form' onSubmit={handleSubmit}>
                        <div className="eimg-cnt">
                        <img loading='eager' src={authimg} className="auth-image" /></div>
                     
                <>
                        <h1 className='login-header'>Login</h1>
                        {message && <div className={`login-message ${error ? 'errorb' : ''}`}><h3>{message}</h3></div>}
                            <input type="text" name="username" className={`prevent-zoom ${error ? 'errorb' : ''}`} id="username" placeholder='Enter User Name' />
                            <input type="password" name="password" className={`prevent-zoom ${error ? 'errorb' : ''}`} id="password" placeholder='Enter Password' />
                            <input type="submit" className='login-submit shd-press-eff' value={loading ? 'Loging In...':"Login"} />
                            <h3>Don't Have an account? <Link to='/signup'>Sign Up</Link></h3></> 
                        </form>
                    </>
                )
            }
        </>
    );
}
