import { useState, useEffect} from 'react'
import { useParams, Link } from 'react-router-dom'
import './css/profiledetail.css'
import './css/upload.css'
import usericon from './assets/user-solid.svg';

function ProfileDetail() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { username } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/${username}`);

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
  }, [username]);

  if (isLoading) {
    return <div className="item-detail-skel flex-col">
         <div className="item-detail-img-skel bg-skel grad-animation">
         
         </div>
         <div className="item-detail-name-skel pd-1-al-l bg-skel flex-col grad-animation"></div>
         <div className="skel-det">
             <div className="item-detail-name-skel pd-1-al-l bg-skel flex-col grad-animation"></div>
         <div className="item-detail-name-skel pd-1-al-l bg-skel grad-animation "></div>
         </div>
 
         <div className="item-detail-img-skel bg-skel grad-animation">
         
         </div>

    </div>;
  }

  if (!data) {
    return <p>Couldn't Find This Profile :-/</p>;
  }

  return (
    <section className='user-profile flex-col'>
     <div className="profile-pic-cnt prof-img">
                    <img className="profile-pic-img" src={data.profile.profile_pic ? data.profile.profile_pic :usericon} alt="Profile" />
    </div>
    <h1>{username}</h1>  <h3>{data.profile.bio}</h3>
    <div className="numbers">
      
    <h3>{data.profile.number}</h3>{data.profile.whatsapp_number?<h3>{data.profile.whatsapp_number}</h3>:<></>}
    </div>
   {data.profile.other? <a href={`${data.profile.other}`}>Link: {data.profile.other}</a>:<></>}
    
    <h2>{username} has Uploaded {data.items.length} Items!</h2>
    <section className="items-container">
        
    {data.items.map((item) => (
      <Link to={`/item/${item.slug}`}key={item.id}>
      <div className='item-card' >
        <div className="item-card-img-cnt" >
          <img loading="lazy" alt={item.item_thumbnail.name} src={`${item.item_thumbnail}`} className="item-image" srcSet="" />
        </div>
        <div className="item-card-desc">
          <h3 className='item-card-name'>{item.item_name.substring(0,22)}</h3>
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

export default ProfileDetail;
