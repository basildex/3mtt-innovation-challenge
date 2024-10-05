import { Fragment, useState, useEffect, useRef } from 'react';
import {
  GoogleMap,
  InfoWindowF,
  MarkerF,
  useLoadScript,
} from '@react-google-maps/api';
import { getAllItems } from '../../data/jsonHandler';
import './index.css'; 

const center = {
  lat: 9.0765,
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
  const [filteredStations, setFilteredStations] = useState([]); 
  const [activeMarker, setActiveMarker] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [notFoundMessage, setNotFoundMessage] = useState(''); 

  useEffect(() => {
    setIsLoading(true);
    getAllItems()
      .then((data) => {
        setStations(data); 
        setFilteredStations(data); 
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

  // Filter the stations based on the search term
  const handleSearch = () => {
    const filtered = stations.filter((station) =>
      station.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredStations(filtered);

    // Set not found message if no stations match the search term
    if (filtered.length === 0) {
      setNotFoundMessage('No stations found matching your search.');
      setActiveMarker(null); 
    } else {
      setNotFoundMessage(''); 
      
      // Set the map's center to the first matched station
      const firstMatchedStation = filtered[0];
      mapRef.current.panTo({
        lat: firstMatchedStation.latitude,
        lng: firstMatchedStation.longitude,
      });
      setActiveMarker(firstMatchedStation.name); 
    }

    // Scroll to the search bar
    document.getElementById('search-bar').scrollIntoView({ behavior: 'smooth' });
  };

  // Trigger the search when Enter is pressed
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Filter stations by type (major, minor, development)
  const filterByType = (type) => {
    const filtered = stations.filter((station) => station.type === type);
    setFilteredStations(filtered);
    setNotFoundMessage(filtered.length === 0 ? 'No stations found' : '');
    
    // Scroll to the search bar
    document.getElementById('search-bar').scrollIntoView({ behavior: 'smooth' });
  };

  // Show all stations
  const showAllStations = () => {
    setFilteredStations(stations); 
    setNotFoundMessage('');e
    if (mapRef.current) {
      mapRef.current.panTo(center); 
    }
    
    // Scroll to the search bar
    document.getElementById('search-bar').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Fragment>
      <div className="container">
        <h1 className="text-center">Nigerian Railway Stations Map</h1>
        {isLoading && <div>Loading stations...</div>}
        {error && <div>Error fetching stations: {error.message}</div>}
        
        {/* Search Bar */}
        <div id="search-bar" className="search-bar">
          <input
            type="text"
            placeholder="Search railway stations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
            onKeyDown={handleKeyDown} 
          />
          <button onClick={handleSearch}>Search</button> 
        </div>

        {/* Filter Buttons */}
        <div className="filter-buttons">
          <button onClick={() => filterByType('major')} className="btn-major">
            Major Stations (Red)
          </button>
          <button onClick={() => filterByType('minor')} className="btn-minor">
            Minor Stations (Blue)
          </button>
          <button onClick={() => filterByType('development')} className="btn-development">
            Stations Under Development (Pink)
          </button>
          <button onClick={showAllStations} className="btn-all">
            Show All
          </button>
        </div>

        {/* Not Found Message */}
        {notFoundMessage && <div className="not-found-message">{notFoundMessage}</div>}

        <div id="root"> 
          {isLoaded ? (
            <GoogleMap
              center={center}
              zoom={9}
              onLoad={(map) => (mapRef.current = map)} 
              onClick={() => setActiveMarker(null)}
              mapContainerClassName="map-container" 
              mapId={import.meta.env.VITE_MAP_ID}
            >
              {filteredStations.map((station) => (
                <MarkerF
                  key={station.name + station.latitude} 
                  position={{ lat: station.latitude, lng: station.longitude }}
                  icon={getMarkerIcon(station.type)}
                  onClick={() => handleActiveMarker(station.name)} 
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
        <div style={{ height: '100px', backgroundColor: 'transparent' }}></div>
      </div>
    </Fragment>
  );
}

export default Home;
