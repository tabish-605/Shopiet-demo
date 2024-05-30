import { useState, useEffect} from 'react'
import {useParams, Link } from 'react-router-dom'
import './css/App.css'
import CerrorPage from './assets/no-cat.svg'

function CategoryPage() {

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { item_category_name } = useParams();
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = () => {
      setImageLoaded(true);
  };
  useEffect(() => {
    

    setIsLoading(true)
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/category/${item_category_name}`);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const jsonData = await response.json();
        
        if (response.status === 200){
          setData(jsonData);
        }else if(response.statusText === 'Error Fetching Data, please try again later :-/')
        console.log(jsonData)
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(true)
      } finally {
        setIsLoading(false); 
      }
    };

    fetchData();
  }, [item_category_name]);

  const latestItems = data
  .reverse(); 

  return (
    <>
      <section className="section-items">
        <div className="items-section">
          <div className="section-header-cnt">
            <h1 className='section-item-header'>{item_category_name}</h1>
            <hr align='left' className='section-divider'/>
          </div>
          {isLoading ? (
            <div className="skeleton">
              <div className="skel skel-1 grad-animation"></div>
              <div className="skel skel-2 grad-animation"></div>
              <div className="skel skel-3 grad-animation"></div>
              <div className="skel skel-4 grad-animation"></div>
            </div>
          ) : latestItems.length === 0 ? (<div className='error-div flex-col'> 
          <div className="eimg-cnt">
            <img loading='lazy' onLoad={handleImageLoad} src={CerrorPage} id='error-cat' className="item-detail-image" />
          </div>
          {imageLoaded && (           
<>
              <p>No {item_category_name} has been uploaded yet... Be the first! </p>
              <Link to='/upload' className='btn-sell'><button>Sell an Item</button></Link></>)}
           </div>
          ) : (
            <section className="items-container">
              {latestItems.map((item) => (
                <Link to={`/item/${item.slug}`}  key={item.id}>
                  <div className='item-card'>
                    <div className="item-card-img-cnt">
                      <img loading="lazy" alt={item.item_name} src={`${item.item_thumbnail}`} className="item-image" srcSet="" />
                    </div>
                    <div className="item-card-desc">
                      <h3 className='item-card-name'>{item.item_name.substring(0,19)}</h3>
                      <div className="item-info">
                        <p className='item-card-price'>R {parseInt(item.item_price).toFixed(0)}</p>
                        <p className='item-card-condition'>{item.item_condition}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          )}
        </div>
      </section>
    </>
  );
  
}

export default CategoryPage
