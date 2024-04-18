import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from './context/AuthContext';

export default function Login() {
    let { loginUser, user, logoutUser } = useContext(AuthContext);
    const [message, setMessage] = useState(null); // State variable for displaying messages

    const handleSubmit = async (e) => {
        setMessage(null)   
        e.preventDefault();
        const formData = {
            username: e.target.username.value,
            password: e.target.password.value
        };
        try {
            await loginUser(formData);
            if (user=null){
                setMessage('Login succesful');  
            }else {
            setMessage('Login failed, check username or credentials');}
        } catch (error) {
            setMessage('Login failed. Please check your credentials.');
        }
    };

    return (
        <> 
            {
          
            
        user ? (
                <div className="welcome-login flex-col">
                    <h1>Hello, {user.username}</h1>
                    <button className='btn-logout' onClick={logoutUser}>Logout</button>
                    <Link to='/upload' className='btn-sell'><button>Sell an Item</button></Link>
                </div>
            ) : (
                <>
                    <h1 className='login-header'>Login</h1>
                    {message && <div className="login-message"><h3>{message}</h3></div>} {/* Display message if exists */}
                    <form className='login-form' onSubmit={handleSubmit}>
                        <input type="text" name="username" className="prevent-zoom" id="username" placeholder='Enter User Name' />
                        <input type="password" name="password" className="prevent-zoom" id="password" placeholder='Enter Password' />
                        <input type="submit" className='login-submit shd-press-eff' value="Login" />
                        <h3>Don't Have an account? <Link to='/signup'>Sign Up</Link></h3>
                    </form>
                </>
            )}
        </>
    );
}
