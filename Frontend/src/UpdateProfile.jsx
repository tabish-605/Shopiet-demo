import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from './context/AuthContext';
import usericon from './assets/user-solid.svg'
import './css/updateprofile.css';

const UpdateProfile = () => {
    const { user } = useContext(AuthContext);
    const [currentProfile, setProfile] = useState({})
    const [userPfp, setPfp] = useState(currentProfile.profile_pic)

    const [formData, setFormData] = useState({
        bio: '',
        number: '',
        whatsapp_number: '',
        other: 'https://shopiet.netlify.app',
        profile_pic: userPfp
    });
    
    useEffect(() => {
    const response = axios.post('http://127.0.0.1:8000/api/update-profile/', {"username":`${user.username}`}
    )
    .then((response) => {
      setProfile(response.data)
      setFormData(response.data)
      setPfp(response.data.profile_pic)
    })
    .catch((err) => {
        if (err.response) {
            console.log(`Upload failed: ${err.response.data}`); 
        } else {
            setMessage('Upload failed: Network error');
        }
        setErrorBorder('errorb'); 
    })}, [user]);
    

    const [loading, setLoading] = useState(false); 
    const [message, setMessage] = useState(null);
    const [errorBorder, setErrorBorder] = useState('');
    
    const handleChange = (e) => {
        const { id, value } = e.target;
        
        setFormData({ ...formData, [id]: value });
        
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, profile_pic: e.target.files[0] });
        const imageUrl = URL.createObjectURL(e.target.files[0]);
        setPfp(imageUrl);
        
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage(null);
        setErrorBorder('');
        setLoading(true);

        let form_data = new FormData();
        form_data.append("username",`${user.username}`);
        if (formData.profile_pic !== currentProfile.profile_pic) {
            form_data.append("profile_pic", formData.profile_pic);
        }
    
        // Append other form data
        for (let key in formData) {
            if (key !== "profile_pic") {
                form_data.append(key, formData[key]);
            }
        }
        const isModified = Object.values(formData).some(value => value !== currentProfile[value]);
        if (!isModified) {
            setLoading(false);
            return;
        }
    
        const response = axios.post('http://127.0.0.1:8000/api/update-profile/', form_data, {
            headers: {
                'content-type': 'multipart/form-data',
            }})
            .then((response) => {
                console.log(response.data)
                setMessage('Changes Saved!')
                setLoading(false); // Set loading to false after successful response
            })
            .catch((err) => {
                setLoading(false); // Set loading to false on error
                if (err.response) {
                    setMessage('There was a problem making changes :-/')
                    console.log(`Upload failed: ${JSON.stringify(err.response.data)}`); 
                } else {
                    setMessage('Upload failed: Network error');
                }
                setErrorBorder('errorb'); 
            });
    };
    
    return (
        <div className='edit-cnt flex-col '>
           
            <form className="edit-form flex-col" onSubmit={handleSubmit}> <div className="profile-pic-cnt">
                <img className="profile-pic-img" src={userPfp}></img>
                <input type="file" className={`edit-photo ${errorBorder}`} id="profile_pic" onChange={handleFileChange} accept="image/*" />
                <label htmlFor="profile_pic" className='lbl-edt-photo'>+</label>
                </div>
                <h1>{user.username}</h1>
            {message && <div className={`upload-message ${errorBorder}`}>{message}</div>} 
                <input type="tel"  pattern="[+]{1}[0-9]{11,14}" id="number" className={`prevent-zoom ${errorBorder}`} value={formData.number} onChange={handleChange} placeholder={currentProfile.number === "" ? "Enter your contact number":currentProfile.number} />
                <input type="tel" pattern="[+]{1}[0-9]{11,14}" id="whatsapp_number" className={`prevent-zoom ${errorBorder}`} value={formData.whatsapp_number} onChange={handleChange} placeholder={currentProfile.number === "" ? "Enter your Whatsapp number":currentProfile.whatsapp_number} />
                <input type="url"  id="other" className={`prevent-zoom ${errorBorder}`} value={formData.other} onChange={handleChange} placeholder={currentProfile.other === "" ? "Link, any useful link about your products, or how to contact you":currentProfile.other} />
                
                <textarea name="description" id="bio" className={`input-desc prevent-zoom ${errorBorder}`} value={formData.bio} onChange={handleChange} placeholder={currentProfile.bio === "" ? "Enter a bio":currentProfile.bio}></textarea> {/* Description textarea */}
           
              
                
              
                {loading ? (
                    <p>Saving Changes{Array(Math.floor((Date.now() / 1000) % 4) + 1).join('.')}</p>
                ) : (<>
                  
                    <input type="submit" className="input-sub shd-press-eff" value="Save" /></>
                )}
            </form>
        </div>
        
    );
};

export default UpdateProfile;
