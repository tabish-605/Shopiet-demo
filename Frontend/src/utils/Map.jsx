import { useEffect } from "react";

const Map = ({ latitude, longitude }) => {
    useEffect(() => {
      if (latitude && longitude) {
        renderMap(latitude, longitude);
      }
    }, [latitude, longitude]);
  
    const renderMap = (latitude, longitude) => {
      const mapOptions = {
        center: { lat: latitude, lng: longitude },
        zoom: 13,
      };
      new window.google.maps.Map(document.getElementById('map'), mapOptions);
    };
  
    return <div id="map" style={{ height: '200px', width: '100%'}}></div>;
  };
  
  export default Map;