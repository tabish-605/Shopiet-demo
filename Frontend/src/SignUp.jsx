import React, { useContext, useState } from 'react';
import AuthContext from './context/AuthContext';

export default function SignUp() {
    const { loginUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Ensure e is an event object and prevent default form submission behavior
        try {
            // Validate form fields
            if (formData.password !== formData.password2) {
                alert('Passwords do not match');
                return;
            }
    
            // Send sign-up request
            const response = await fetch('http://127.0.0.1:8000/api/signup/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
    
            if (response.ok) {
                // If sign-up is successful, login the user
                await loginUser(e); // Pass the event object to loginUser
                // Optionally, redirect the user to a different page or display a success message
                console.log('Sign-up successful');
                loginUser; // This line seems unnecessary
            } else {
                // If sign-up fails, handle the error
                console.error('Sign-up failed:', response.statusText);
                // Optionally, display an error message to the user
            }
        } catch (error) {
            console.error('Error:', error);
            // Optionally, display an error message to the user
        }
    };
    return (
        <>
            <form onSubmit={handleSubmit}>
                <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder='Enter User Name' />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder='Enter Email' />
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder='Enter Password' />
                <input type="password" name="password2" value={formData.password2} onChange={handleChange} placeholder='Enter Password Again' />
                <input type="submit" value="Sign Up" />
            </form>
        </>
    );
}
