import React, { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from './context/AuthContext';

const UploadItem = () => {
    const {user} = useContext(AuthContext)
    console.log(user.user_id)
    const [formData, setFormData] = useState({
        item_name: '',
        item_price: '',
        item_description: '',
        item_condition: 'used',
        category: '',
        user:user.user_id,
        item_thumbnail: null,
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, item_thumbnail: e.target.files[0] });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let form_data = new FormData();
        for (let key in formData) {
            form_data.append(key, formData[key]);
        }
        console.log(JSON.stringify(formData))
        let url = 'https://shopietbackend-wlzwbcznba-bq.a.run.app/api/upload/';
        axios.post(url, form_data, {
            headers: {
                'content-type': 'multipart/form-data'
            }
        }).then(response => {
            console.log(response.data);
        }).catch(err => console.log(err));
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="text" id="item_name" value={formData.item_name} onChange={handleChange} placeholder="Enter Item Name" required />
                <input type="number" id="item_price" value={formData.item_price} onChange={handleChange} placeholder="Enter Item Price" required />
                <input type="text" id="item_description" value={formData.item_description} onChange={handleChange} placeholder="Enter Item Description" required />
                <select id="item_condition" value={formData.item_condition} onChange={handleChange}>
                    <option value="love">Needs Love</option>
                    <option value="used">Used</option>
                    <option value="like_new">Like New</option>
                    <option value="new">New</option>
                </select>
                <select id="category" value={formData.category} onChange={handleChange}>
                    <option value="">Select Category</option>
                    <option value="1">Tech</option>
                    <option value="2">Furniture</option>
                    <option value="3">Car Parts</option>
                </select>
                <input type="file" id="item_thumbnail" onChange={handleFileChange} accept="image/*" required />
                <input type="submit" value="Post" />
            </form>
        </div>
    );
}

export default UploadItem;
