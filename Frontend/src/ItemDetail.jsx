import { useState, useEffect} from 'react'
import { useParams } from 'react-router-dom'
import './css/itemdetail.css'
function ItemDetail() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { slug } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/item/${slug}`);

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
  }, [slug]);

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
    return <p>Couldn't Find This Item :-/</p>;
  }

  return (
    <>
    <div className="item-detail-cnt">
     <div className="item-detail-img-cnt">
        <img loading="lazy" alt={data.item_name} src={`${data.item_thumbnail}`} className="item-detail-image" srcSet="" />
     </div>
      
      <h1 className="item-detail-name pd-1-al-l">{data.item_name}</h1>
      <p className="item-detail-cat pd-1-al-l">/{data.item_category_name}</p>
      <div className="cat-price-cnt">
        
        <h2 className='item-detail-user'>{data.item_username}</h2>
        <h2 className='item-detail-price'>R {data.item_price}</h2>
      </div>
      
      
      <div className="item-desc-cnt pd-1-al-l">
        <h3>Condition</h3>
        
        <p >{data.item_condition}</p><br />
        <h3>Description</h3>
        <p>{data.item_description}</p>
      </div>
     
      

    </div> <div className="detail-contact">
        <h2>How to Contact Me:</h2>
        <div className="contact-details">
            <h3>Phone:</h3>
            <h3>Whatsapp:</h3>
            <h3>Other:</h3>
        </div>
      </div>
    </>
  );
}

export default ItemDetail;
