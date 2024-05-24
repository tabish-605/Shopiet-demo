import React, { useContext, useState } from 'react';
import axios from 'axios';
import AuthContext from './context/AuthContext';
import './css/signup.css';
import { useNavigate, Link } from 'react-router-dom';
import PhoneInput from 'react-phone-number-input';

export default function SignUp() {
    const navigate = useNavigate();
    let { loginUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        number: ''
    });
    const [message, setMessage] = useState(null);
    const [signStatus, setSignStatus] = useState('Sign In')
    const [errors, setErrors] = useState({
        username: false,
        email: false,
        password: false,
        password2: false,
        number:false
    });

    const handleNumChange = (value, id) => {
        setFormData({ ...formData, [id]: value });
        setErrors({ ...errors, number: false });
       
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: false });
    };

    const validatePhoneNumber = (phoneNumber) => {
    
        const phoneRegex = /^(?:\+27|0)(?:\d(?:[ -]?\d{2}){4})$/;
        return phoneRegex.test(phoneNumber);
    };
    
    const handleSubmit = async (e) => {
        setMessage(null);
        e.preventDefault();
        console.log(JSON.stringify(formData))
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

            if (!validatePhoneNumber(formData.number)) {
                setMessage(`Incorrect phone number format.`);
                setErrors({ ...errors, number: true });
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
           setSignStatus('Signing In...')
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/signup/`, JSON.stringify(formData), {
                headers: {
                    'Content-Type': 'application/json'
                }
                
            });   
            console.log('Response:', response);

        if (response.status === 201) {
            await loginUser(formData);
            navigate('/login');
            setMessage('Sign-up successful');
        } else if (response.status === 409) {
            setMessage('A user with that email already exists');
            setErrors({ ...errors, username: true });
            setErrors({ ...errors, email: true });
        } else {
            setMessage('Sign-up failed');
        }
        } catch (error) {
            if (error.response) {
                const responseData = error.response.data;
                if (responseData.message === 'A user with that username already exists') {
                    setMessage('A user with that username or email already exists');
                    setErrors({ ...errors, username: true });
                    setErrors({ ...errors, email: true });
                } else if (responseData.message === 'A user with that email already exists') {
                    setMessage('A user with that email already exists');
                    setErrors({ ...errors, email: true });
                } else if (error.response.status === 400) {
                    setMessage('A user with that username already exsits');  
                    setErrors({ ...errors, username: true });  
                } else {
                    setMessage('Sign-up failed');
                }
            } else {
                // Generic error handling
                setMessage('Error occurred during sign-up');
            }
        } finally{
            setSignStatus('Sign Up')
        }
    };

    return (
        <>
            
            <form className='signup-form' onSubmit={handleSubmit}>
            <h1 className='signup-header'> Sign Up</h1>
            {message && <div className="signup-message"><h3 className='error-message'>{message}</h3></div>}
                <input type="text" name="username" className={`${errors.username ? 'errorb' : ''}`} value={formData.username} onChange={handleChange} placeholder='Enter User Name' />
                <input type="email" name="email" className={`${errors.email ? 'errorb' : ''}`} value={formData.email} onChange={handleChange} placeholder='Enter Email' />
                <input type="password" name="password" className={`${errors.password ? 'errorb' : ''}`} value={formData.password} onChange={handleChange} placeholder='Enter Password' />
                <input type="password" name="password2" className={`${errors.password2 ? 'errorb' : ''}`} value={formData.password2} onChange={handleChange} placeholder='Enter Password Again' />
                <PhoneInput
                    placeholder="Enter your contact number"
                    value={formData.number}
                    className={`${errors.number ? 'errorb' : ''}`}
                    defaultCountry="ZA"
                    onChange={(value) => handleNumChange(value, 'number')}
                />
                <input type="submit" className="signup-submit shd-press-eff" name='signup-submit' value={signStatus} />
            <h3>Already Have an Account? <Link to='/login'>Log in</Link></h3></form>
            
        </>
    );
}
