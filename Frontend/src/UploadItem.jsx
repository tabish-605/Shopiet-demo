import React, { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from './context/AuthContext';
import './css/upload.css';

const UploadItem = () => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        item_name: '',
        item_price: '',
        item_description: '',
        item_condition: 'used',
        category: 960732137074130945,
        item_username: user.username,
        item_thumbnail: null,
    });

    const [loading, setLoading] = useState(false); // State to track loading status
    const [message, setMessage] = useState(null); // State to track messages
    const [errorBorder, setErrorBorder] = useState(''); // State to track border color for error

    const handleChange = (e) => {
        const { id, value } = e.target;
        if (e.target.type === 'radio') {
            setFormData({ ...formData, item_condition: value });
        } else {
            setFormData({ ...formData, [id]: value });
        }
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, item_thumbnail: e.target.files[0] });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage(null);
        setErrorBorder('');
        if (!formData.item_name || !formData.item_price || !formData.item_description || !formData.item_thumbnail) {
            setMessage('Please fill in all required fields.'); 
            setErrorBorder('errorb');
            return;
        }
        if (!/^\d+$/.test(formData.item_price)){
            setMessage('Please enter a valid number.');
            setErrorBorder('errorb');
            return;
        }
        setLoading(true);
        let form_data = new FormData();
        for (let key in formData) {
            form_data.append(key, formData[key]);
        }
        let url = 'https://shopietbackend-wlzwbcznba-bq.a.run.app/api/upload/';
        const response = axios.post(url, form_data, {
                headers: {
                    'content-type': 'multipart/form-data',
                },
            })
            .then((response) => {
                setLoading(false);
                console.log(response.data)
                setMessage('Upload successful');
                setFormData({
                    item_name: '',
                    item_price: '',
                    item_description: '',
                    item_condition: 'used',
                    category: 960732137074130945,
                    item_username: user.username,
                    item_thumbnail: null,
                });
            })
            .catch((err) => {
                setLoading(false); 
                if (err.response) {
                    setMessage(`Upload failed: ${err.response.data}`); 
                } else {
                    setMessage('Upload failed: Network error');
                }
                setErrorBorder('errorb'); 
            });
    };
    
    return (
        <div className='upload-cnt flex-col '>
           
            <form className="upload-form flex-col" onSubmit={handleSubmit}> <h1>Say Goodbye</h1>
            {message && <div className={`upload-message ${errorBorder}`}>{message}</div>} 
                <input type="text" id="item_name" className={`prevent-zoom ${errorBorder}`} value={formData.item_name} onChange={handleChange} placeholder="Enter Item Name" required />
                <div >R <input type="number" id="item_price"  className={`prevent-zoom ${errorBorder}`} value={formData.item_price} onChange={handleChange} placeholder="Enter Item Price" required /></div>
                <textarea name="description" id="item_description" className={`input-desc prevent-zoom ${errorBorder}`} value={formData.item_description} onChange={handleChange} placeholder='Enter Description'></textarea> {/* Description textarea */}
                <div>
                    <label>
                        <input
                            type="radio"
                            name="item_condition"
                            value="Love"
                            checked={formData.item_condition === 'Love'}
                            onChange={handleChange}
                        />
                        <span className="chip">Needs Love</span>
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="item_condition"
                            value="Used"
                            checked={formData.item_condition === 'Used'}
                            onChange={handleChange}
                        />
                        <span className="chip">Used</span>
                    </label>
                    <label >
                        <input
                            type="radio"
                            name="item_condition"
                            value="L-New"
                            checked={formData.item_condition === 'L-New'}
                            onChange={handleChange}
                        />
                        <span className="chip">Like New</span>
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="item_condition"
                            value="New"
                            checked={formData.item_condition === 'New'}
                            onChange={handleChange}
                        />
                        <span className="chip">New</span>
                    </label>
                </div>
                <select id="category"  className={`prevent-zoom ${errorBorder}`} value={formData.category} onChange={handleChange}>
                <option value="">Select Category</option>
                    <option value="960732137074130945">Tech</option>
                    <option value="960807240398831617">Furniture</option>
                    <option value="960807346087755777">Car Parts</option>
                    <option value="960807528684290049">Gardening</option>
                    <option value="963308098083192833">Books</option>
                    <option value="963308226167734273">Gym Equipment</option>
                    <option value="963308337627725825">Toys</option>
                    <option value="963308422799785985">Kids</option>
                    <option value="963308587154767873">Car Accessories</option>
                    
                </select>
                <input type="file" className={`input-thumb ${errorBorder}`} id="item_thumbnail" onChange={handleFileChange} accept="image/*" required />
                {loading ? (
                    <p>Uploading{Array(Math.floor((Date.now() / 1000) % 4) + 1).join('.')}</p>
                ) : (<>
                  
                    <input type="submit" className="input-sub shd-press-eff" value="Post" /></>
                )}
            </form>
        </div>
    );
};

export default UploadItem;
