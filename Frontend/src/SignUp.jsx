import React, { useContext, useState } from 'react';
import axios from 'axios';
import AuthContext from './context/AuthContext';
import './css/signup.css';

export default function SignUp() {
    let { loginUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: ''
    });
    const [message, setMessage] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        setMessage(null)
        e.preventDefault();
        try {
            if (formData.password !== formData.password2) {
                setMessage('Passwords do not match');
                return;
            } else if (formData.password.length < 8 || formData.password.length < 8){
                setMessage('Password is too short, should be at least 8 characters ');
                return;

            }

            const response = await axios.post('https://shopietbackend-wlzwbcznba-bq.a.run.app/api/signup/', formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 201) {
                await loginUser(e);
                setMessage('Sign-up successful');
            } else if (response.status === 400 && response.data.message === 'A user with that username already exists') {
                setMessage('A user with that username already exists');
            } else {
                setMessage('Sign-up failed');
            }
        } catch (error) {
            setMessage('Error occurred during sign-up');
        }
    };

    return (
        <>
            <h1 className='signup-header'> Sign Up</h1>
            {message && <div className="signup-message"><h3>{message}</h3></div>}
            <form className='signup-form' onSubmit={handleSubmit}>
                <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder='Enter User Name' />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder='Enter Email' />
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder='Enter Password' />
                <input type="password" name="password2" value={formData.password2} onChange={handleChange} placeholder='Enter Password Again' />
                <input type="submit" className="signup-submit" name='signup-submit' value="Sign Up" />
            </form>
        </>
    );
}
