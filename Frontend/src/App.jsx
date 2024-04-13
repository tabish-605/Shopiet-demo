import { useState, useEffect } from 'react'

import './css/App.css'

function App() {
  const [count, setCount] = useState(0)
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://shopietbackend-wlzwbcznba-bq.a.run.app/api');

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

  return (
    <>
      
      {/*<section className="container">
        {data.slice(0,4).reverse().map((item, index) => <div>
          <h1>{item.item_name}</h1>
          <img loading="lazy" src={`https://shopietbackend-wlzwbcznba-bq.a.run.app${item.item_thumbnail}`} className="local-image" srcSet="" />
          <p>{item.item_description}</p>
          <p>R{item.item_price}</p>
          <p>{item.item_condition}</p>
        </div>)}
        </section> */}
      <h1>Shopiet</h1>
    </>
  )
}

export default App
