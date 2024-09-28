import { Fragment, useState, useEffect, useRef } from 'react';
import {
  GoogleMap,
  InfoWindowF,
  MarkerF,
  useLoadScript,
} from '@react-google-maps/api';
import { getAllItems } from '../../data/jsonHandler';
import './index.css';

const containerStyle = {
  width: '100%',
  height: '100vh',
};

const center = {
  lat: 9.0765, // Set the center point to a central location in Nigeria
  lng: 7.3986,
};

const libraries = ['places'];

function Home() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const mapRef = useRef(null);
  const [stations, setStations] = useState([]);
  const [activeMarker, setActiveMarker] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    getAllItems()
      .then((data) => {
        setStations(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err);
        setIsLoading(false);
      });
  }, []);

  const handleActiveMarker = (marker) => {
    if (marker === activeMarker) {
      return;
    }
    setActiveMarker(marker);
  };

  const getMarkerIcon = (stationType) => {
    if (stationType === 'major') {
      return {
        url: '/red-pin.png',
        scaledSize: { width: 20, height: 20 },
      };
    } else if (stationType === 'minor') {
      return {
        url: '/blue-pin.png',
        scaledSize: { width: 20, height: 20 },
      };
    } else if (stationType === 'development') {
      return {
        url: '/pink-pin.png',
        scaledSize: { width: 20, height: 20 },
      };
    }
    return {
      url: '/blue-pin.png',
      scaledSize: { width: 20, height: 20 },
    };
  };

  return (
    <Fragment>
      <div className="container">
        <h1 className="text-center">Nigerian Railway Stations Map</h1>
        {isLoading && <div>Loading stations...</div>}
        {error && <div>Error fetching stations: {error.message}</div>}
        <div style={{ height: '100vh', width: '100%' }}>
          {isLoaded ? (
            <GoogleMap
              center={center}
              zoom={9}
              onLoad={(map) => (mapRef.current = map)}
              onClick={() => setActiveMarker(null)}
              mapContainerStyle={containerStyle}
              mapId={import.meta.env.VITE_MAP_ID}
            >
              {stations.map((station) => (
                <MarkerF
                  key={station.name + station.latitude} // Ensure unique key
                  position={{ lat: station.latitude, lng: station.longitude }}
                  icon={getMarkerIcon(station.type)}
                  onClick={() => handleActiveMarker(station.name)} // Set the marker as active when clicked
                >
                  {activeMarker === station.name && (
                    <InfoWindowF
                      onCloseClick={() => setActiveMarker(null)}
                      position={{
                        lat: station.latitude,
                        lng: station.longitude,
                      }}
                    >
                      <div>
                        <h2 className="info-header">{station.name}</h2>
                        <p className="info-content">{station.details}</p>
                      </div>
                    </InfoWindowF>
                  )}
                </MarkerF>
              ))}
            </GoogleMap>
          ) : null}
        </div>
      </div>
    </Fragment>
  );
}

export default Home;
