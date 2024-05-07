import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from './context/AuthContext';
import usericon from './assets/user-solid.svg';
import './css/updateprofile.css';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';

const UpdateProfile = () => {
    const { user } = useContext(AuthContext);
    const [currentProfile, setProfile] = useState({});
    const [userPfp, setPfp] = useState(currentProfile.profile_pic === null || currentProfile.profile_pic === undefined ? usericon : currentProfile.profile_pic);
    console.log(currentProfile.profile_pic);
    const [formData, setFormData] = useState({
        bio: '',
        number: '',
        whatsapp_number: '',
        other: 'https://shopiet.netlify.app',
        profile_pic: userPfp,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/update-profile/`, { username: `${user.username}` });
                setProfile(response.data);
                setFormData(response.data);
                setPfp(response.data.profile_pic === null || response.data.profile_pic === undefined ? usericon : response.data.profile_pic);
            } catch (err) {
                console.error('Error fetching profile data:', err);
            }
        };
        fetchData();
    }, [user]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [errorBorder, setErrorBorder] = useState('');
    const [phoneError, setPhoneError] = useState({ number: '', whatsapp_number: '' });

    const handleChange = (value, id) => {
        setFormData({ ...formData, [id]: value });
        setPhoneError({ ...phoneError, [id]: '' });
        setErrorBorder('');
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, profile_pic: e.target.files[0] });
        const imageUrl = URL.createObjectURL(e.target.files[0]);
        setPfp(imageUrl);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setErrorBorder('');
        setLoading(true);

        const isModified = Object.values(formData).some((value) => value !== currentProfile[value]);
        if (!isModified) {
            setLoading(false);
            return;
        }

        // Validation
        if (!validatePhoneNumber(formData.number) && isModified) {
            setPhoneError({ ...phoneError, number: 'Invalid phone number format' });
            setErrorBorder('errorb');
            setLoading(false);
            return;
        }
        if (!validatePhoneNumber(formData.whatsapp_number) && isModified) {
            setPhoneError({ ...phoneError, whatsapp_number: 'Invalid phone number format' });
            setErrorBorder('errorb');
            setLoading(false);
            return;
        }

        // Construct form data
        let form_data = new FormData();
        form_data.append('username', `${user.username}`);
        if (formData.profile_pic !== currentProfile.profile_pic) {
            form_data.append('profile_pic', formData.profile_pic);
        }
        // Append other form data
        for (let key in formData) {
            if (key !== 'profile_pic') {
                form_data.append(key, formData[key]);
            }
        }

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/update-profile/`, form_data, {
                headers: {
                    'content-type': 'multipart/form-data',
                },
            });
            console.log(response.data);
            setMessage('Changes Saved!');
        } catch (err) {
            if (err.response) {
                setMessage('There was a problem making changes :-/');
                console.error(`Upload failed: ${JSON.stringify(err.response.data)}`);
            } else {
                setMessage('Upload failed: Network error');
            }
            setErrorBorder('errorb');
        }
        setLoading(false);
    };

    const validatePhoneNumber = (phoneNumber) => {
        const phoneRegex = /^\+[0-9]{11,14}$/;
        return phoneRegex.test(phoneNumber);
    };

    return (
        <div className="edit-cnt flex-col ">
            <form className="edit-form flex-col" onSubmit={handleSubmit}>
                <div className="profile-pic-cnt">
                    <img className="profile-pic-img" src={userPfp} alt="Profile" />
                    <input type="file" className={`edit-photo ${errorBorder}`} id="profile_pic" onChange={handleFileChange} accept="image/*" />
                    <label htmlFor="profile_pic" className="lbl-edt-photo">
                        +
                    </label>
                </div>
                <h1>{user.username}</h1>
                {message && <div className={`upload-message`}>{message}</div>}
                <PhoneInput
                    placeholder="Enter your contact number"
                    value={formData.number}
                    className={`${errorBorder}`}
                    defaultCountry="ZA"
                    onChange={(value) => handleChange(value, 'number')}
                />
                {phoneError.number && <div className="error-message">{phoneError.number}</div>}
                <PhoneInput
                className={`${errorBorder}`}
                    placeholder="Enter your Whatsapp number"
                    value={formData.whatsapp_number}
                    defaultCountry="ZA"
                    onChange={(value) => handleChange(value, 'whatsapp_number')}
                />
                {phoneError.whatsapp_number && <div className="error-message">{phoneError.whatsapp_number}</div>}
                <input type="url" id="other" className={`prevent-zoom ${errorBorder}`} value={formData.other} onChange={(e) => handleChange(e.target.value, 'other')} placeholder={currentProfile.other === '' ? 'Link, any useful link about your details or products' : currentProfile.other} />
                <textarea name="description" id="bio" className={`input-desc prevent-zoom ${errorBorder}`} value={formData.bio} onChange={(e) => handleChange(e.target.value, 'bio')} placeholder={currentProfile.bio === '' ? 'Enter a bio' : currentProfile.bio}></textarea>
                {loading ? (
                    <p>
                        Saving Changes{Array(Math.floor((Date.now() / 1000) % 4) + 1).join('.')}
                    </p>
                ) : (
                    <>
                        <input type="submit" className="input-sub shd-press-eff" value="Save" />
                    </>
                )}
            </form>
        </div>
    );
};

export default UpdateProfile;
