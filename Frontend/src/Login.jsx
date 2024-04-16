import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from './context/AuthContext';


export default function Login() {
    const { loginUser, user, logoutUser } = useContext(AuthContext);
    const [message, setMessage] = useState(null); // State variable for displaying messages

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            username: e.target.username.value,
            password: e.target.password.value
        };
        try {
            await loginUser(formData);
            setMessage('Login successful');
        } catch (error) {
            setMessage('Login failed. Please check your credentials.');
        }
    };

    return (
        <>
            {user ? (
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
                        <input type="text" name="username" id="username" placeholder='Enter User Name' />
                        <input type="password" name="password" id="password" placeholder='Enter Password' />
                        <input type="submit" className='login-submit' value="Login" />
                        <h3>Don't Have an account? <Link to='/signup'>Sign Up</Link></h3>
                    </form>
                </>
            )}
        </>
    );
}
