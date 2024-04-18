import React, { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from './context/AuthContext';
import './css/upload.css';

const UploadItem = () => {
    const { user } = useContext(AuthContext);
    console.log(user.id);
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        console.log(user.user_id);
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, item_thumbnail: e.target.files[0] });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.item_name || !formData.item_price || !formData.item_description || !formData.item_thumbnail) {
            alert('Please fill in all required fields.'); // Display error message
            return;
        }
        setLoading(true);
        let form_data = new FormData();
        for (let key in formData) {
            form_data.append(key, formData[key]);
        }
        console.log(JSON.stringify(formData));
        let url = 'https://shopietbackend-wlzwbcznba-bq.a.run.app/api/upload/';
        axios
            .post(url, form_data, {
                headers: {
                    'content-type': 'multipart/form-data',
                },
            })
            .then((response) => {
                console.log(response.data);
                setLoading(false); // Set loading to false when upload is successful
            })
            .catch((err) => {
                console.log(err);
                setLoading(false); // Set loading to false in case of error
            });
    };

    return (
        <div>
            <h1>Say Goodbye</h1>
            <form className="upload-form flex-col" onSubmit={handleSubmit}>
                <input type="text" id="item_name" className="prevent-zoom" value={formData.item_name} onChange={handleChange} placeholder="Enter Item Name" required />
                <div >R <input type="number" id="item_price"  className="prevent-zoom"  value={formData.item_price} onChange={handleChange} placeholder="Enter Item Price" required /></div>
                <input type="text" className="input-desc prevent-zoom" id="item_description" value={formData.item_description} onChange={handleChange} placeholder="Enter Item Description" required />
                <select id="item_condition"  className="prevent-zoom"  value={formData.item_condition} onChange={handleChange}>
                    <option value="needs love">Needs Love</option>
                    <option value="used">Used</option>
                    <option value="like new">Like New</option>
                    <option value="new">New</option>
                </select>
                <select id="category"  className="prevent-zoom"  value={formData.category} onChange={handleChange}>
                    <option value="">Select Category</option>
                    <option value="960732137074130945">Tech</option>
                    <option value="960807240398831617">Furniture</option>
                    <option value="960807346087755777">Car Parts</option>
                    <option value="960807528684290049">Gardening</option>
                </select>
                <input type="file" className="input-thumb" id="item_thumbnail" onChange={handleFileChange} accept="image/*" required />
                {loading ? ( // Display loading message with animated dots if loading is true
                    <p>Uploading{Array(Math.floor((Date.now() / 1000) % 4) + 1).join('.')}</p>
                ) : (<>
                  
                    <input type="submit" className="input-sub shd-press-eff" value="Post" /></>
                )}
            </form>
        </div>
    );
};

export default UploadItem;
