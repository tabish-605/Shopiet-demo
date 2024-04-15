import React, { useContext, useState } from 'react';
import AuthContext from './context/AuthContext';
import './css/signup.css';

export default function SignUp() {
    const { loginUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: ''
    });
    const [message, setMessage] = useState(null); // State variable for displaying messages

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.password !== formData.password2) {
                setMessage('Passwords do not match lil bro');
                return;
            }

            const response = await fetch('https://shopietbackend-wlzwbcznba-bq.a.run.app/api/signup/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                await loginUser(e);
                setMessage('Sign-up successful');
            } else {
                const data = await response.json();
                setMessage(`Sign-up failed: ${data.detail}`);
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
