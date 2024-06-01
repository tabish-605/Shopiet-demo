import { useState, useEffect, useContext} from 'react'
import {  Link } from 'react-router-dom'
import AuthContext from './context/AuthContext';
import './css/profiledetail.css'
import './css/App.css'
import saveimg from './assets/saved.svg'


function SavedItems() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/saved-items/${user.username}`);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false); 
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div className="skeleton">
    <div className="skel skel-1 grad-animation"></div>
    <div className="skel skel-2 grad-animation"></div>
    <div className="skel skel-3 grad-animation"></div>
    <div className="skel skel-4 grad-animation"></div>
  </div>
  }

  if (!data) {
    return <p>Couldn't Get to Your Saved Items :-\</p>;
  }
  if (data.length ===0) {
    return <><p>You Haven't Saved an Item Yet!</p>
      <Link to ='/' className='btn-sell' > <button >Continue Browsing</button></Link></>
  }

  return (
    <section className='user-profile saved flex-col'>
      <div className="eimg-cnt">
                        <img loading='lazy' src={saveimg} className="auth-image" /></div>
    <h2 className='saved-header'> You Have {data.length} Saved Items</h2>
    <section className="items-container">
        
    {data.map((item) => (
      <Link to={`/item/${item.slug}`}key={item.id}>
      <div className='item-card' >
        <div className="item-card-img-cnt" >
          <img loading="lazy" alt={item.item_thumbnail.name} src={`${item.item_thumbnail}`} className="item-image" srcSet="" />
        </div>
        <div className="item-card-desc">
          <h3 className='item-card-name'>{item.item_name.substring(0,24)}</h3>
          <div className="item-info">
            <p className='item-card-price'>R {parseInt(item.item_price).toFixed(0)}</p>
            <p className='item-card-condition'>{item.item_condition}</p>
          </div>
        </div>
      </div>
      </Link>
    ))}
  </section>
    </section>
  );
}

export default SavedItems;
