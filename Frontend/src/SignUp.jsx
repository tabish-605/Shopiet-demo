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
    const [errors, setErrors] = useState({
        username: false,
        email: false,
        password: false,
        password2: false
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: false });
    };

    const handleSubmit = async (e) => {
        setMessage(null);
        e.preventDefault();
        try {
            if (formData.password !== formData.password2) {
                setMessage('Passwords do not match');
                setErrors({ ...errors, password2: true });
                return;
            } else if (formData.password.length < 8 || formData.password2.length < 8) {
                setMessage('Password is too short, should be at least 8 characters ');
                setErrors({ ...errors, password: true, password2: true });
                return;
            } else if (/^\d+$/.test(formData.password)) {
                setMessage(`Password can't be all numbers`);
                setErrors({ ...errors, password: true });
                return;
            }

            if (/\s/.test(formData.username)) {
                setMessage(`Username can't contain spaces`);
                setErrors({ ...errors, username: true });
                return;
            }

            if (!/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(formData.email)) {
                setMessage('Please enter a valid email');
                setErrors({ ...errors, email: true });
                return;
            }

            const response = await axios.post('https://shopietbackend-wlzwbcznba-bq.a.run.app/api/signup/', formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 201) {
                await loginUser(formData);
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
            {message && <div className="signup-message"><h3 className='error-message'>{message}</h3></div>}
            <form className='signup-form' onSubmit={handleSubmit}>
                <input type="text" name="username" className={`${errors.username ? 'errorb' : ''}`} value={formData.username} onChange={handleChange} placeholder='Enter User Name' />
                <input type="email" name="email" className={`${errors.email ? 'errorb' : ''}`} value={formData.email} onChange={handleChange} placeholder='Enter Email' />
                <input type="password" name="password" className={`${errors.password ? 'errorb' : ''}`} value={formData.password} onChange={handleChange} placeholder='Enter Password' />
                <input type="password" name="password2" className={`${errors.password2 ? 'errorb' : ''}`} value={formData.password2} onChange={handleChange} placeholder='Enter Password Again' />
                <input type="submit" className="signup-submit shd-press-eff" name='signup-submit' value="Sign Up" />
            </form>
        </>
    );
}
