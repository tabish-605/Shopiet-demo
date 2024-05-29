import React from "react";
import pnf from './assets/pnf-404.svg'
const NotFound = () => {
    return (
      <div>
        <div className='error-div flex-col'> <div className="eimg-cnt">
          <img loading="lazy"  src={pnf} id='error-404 pnf' className="item-detail-image" />
          </div></div>
        <h2>Page Not Found</h2>
        <p>Sorry, the page you are looking for does not exist.</p>
      </div>
    );
  };

export default NotFound;