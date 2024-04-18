import { useState, useEffect} from 'react'
import exchangeImg from './assets/exchange.webp'
import { Link } from 'react-router-dom'


import './css/App.css'

function App() {
  const [count, setCount] = useState(0)
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://shopietbackend-wlzwbcznba-bq.a.run.app/api/');

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
      } finally {
        setIsLoading(false); 
      }
    };

    fetchData();
  }, []);

  const latestItems = data
   // Sort items in descending order based on timestamp
  .slice(0, 10).reverse(); 

  return (
    <>
     <section className="section-items">
        <div className="cta">
          <div className="cta-text">
            <div className="cta-text-head"> <h2>Give Your Preloved Items a New Home</h2></div>
           <div className="cta-text-btn">
           <Link to ={'/upload'}> <button>Sell an Item</button></Link>
           </div>
           
          </div>
          <div className="cta-image">
            <img src={exchangeImg} alt="couple-exchanging-items" />
          </div>
        </div>
        <div className="items-section">
          <div className="section-header-cnt">
          <h1 className='section-item-header'>Latest </h1>
        <h3 className='section-item-sub-header'>All the newest stuff</h3>
        <hr align='left' className='section-divider'/>
        </div>
        <section className="items-container">
        {latestItems.map((item, index) => <div className='item-card' key={index}>
          <div className="item-card-img-cnt">
            <img loading="lazy" alt={item.item_thumbnail.name} src={`${item.item_thumbnail}`} className="item-image" srcSet="" />
          </div>
          <div className="item-card-desc">
             <h3 >{item.item_name}</h3>
             <div className="item-info">
               <p className='item-card-price'>R {item.item_price}</p>
               <div className="item-meta">
                <p>{item.item_condition}</p>
          
          <p>{item.item_username}</p>
               </div>
          
             </div>
         
          </div>
         
        </div>)}
        </section> 
        </div>
        
      
    </section>   
    
    </>
  )
}

export default App
