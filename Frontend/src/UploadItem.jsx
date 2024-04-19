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
                <textarea name="description" id="item_description"className="input-desc prevent-zoom" value={formData.description} onChange={handleChange} placeholder='Enter Description'></textarea> {/* Description textarea */}
                <div>
                    <label>
                        <input
                            type="radio"
                            name="item_condition"
                            id="item_condition"
                            value="love"
                            checked={formData.item_condition === 'love'}
                            onChange={handleChange}
                        />
                        <span className="chip">Needs Love</span>
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="item_condition"
                            value="used"
                            id="item_condition"
                            checked={formData.item_condition === 'used'}
                            onChange={handleChange}
                        />
                        <span className="chip">Used</span>
                    </label>
                    <label >
                        <input
                            type="radio"
                            name="item_condition"
                            value="like_new"
                            id="item_condition"
                            checked={formData.item_condition === 'like_new'}
                            onChange={handleChange}
                        />
                        <span className="chip">Like New</span>
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="item_condition"
                            value="new"
                            id="item_condition"
                            checked={formData.item_condition === 'new'}
                            onChange={handleChange}
                        />
                        <span className="chip">New</span>
                    </label>
                </div>
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
