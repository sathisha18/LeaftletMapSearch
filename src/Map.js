import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-control-geocoder';

// Initialize the OpenStreetMap provider
const provider = new OpenStreetMapProvider();

const RoutingMachine = ({ start, destination }) => {
  const map = useMap();

  // Clear previous routes
  map.eachLayer((layer) => {
    if (layer instanceof L.Routing.Control) {
      map.removeLayer(layer);
    }
  });

  if (start && destination) {
    L.Routing.control({
      waypoints: [L.latLng(start[0], start[1]), L.latLng(destination[0], destination[1])],
      routeWhileDragging: true,
    }).addTo(map);
  }

  return null;
};

const MapComponent = () => {
  const [startPosition, setStartPosition] = useState([20.5937, 78.9629]); // India default
  const [destinationPosition, setDestinationPosition] = useState([0, 0]); // Empty initially
  const [error, setError] = useState('');

  // Get user's current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setStartPosition([latitude, longitude]);
        },
        () => {
          setError('Unable to retrieve your location');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser');
    }
  }, []);

  const handleSearch = async (event, setPosition) => {
    event.preventDefault();
    const query = event.target.elements.search.value.trim();

    if (!query) {
      setError('Please enter a location');
      return;
    }

    try {
      const results = await provider.search({ query });

      if (results.length > 0) {
        const { x, y } = results[0]; // Longitude (x) and Latitude (y)
        setPosition([y, x]); // Update the state with new coordinates
        setError('');
      } else {
        setError('No results found. Please try a different query.');
      }
    } catch (err) {
      setError('Error fetching location. Please try again later.');
    }
  };

  const handleSwap = () => {
    const temp = startPosition;
    setStartPosition(destinationPosition);
    setDestinationPosition(temp);
  };

  const handleSum = () => {
    const sumLatitude = startPosition[0] + destinationPosition[0];
    const sumLongitude = startPosition[1] + destinationPosition[1];
    alert(`Sum of Latitudes: ${sumLatitude}\nSum of Longitudes: ${sumLongitude}`);
  };

  return (
    <div className="container mt-5">
      <h3 className="text-center mb-4">Route Finder</h3>

      <div className="row mb-4">
        <div className="col-md-5 mb-2">
          <form onSubmit={(event) => handleSearch(event, setStartPosition)}>
            <input
              type="text"
              name="search"
              className="form-control"
              placeholder="Starting location..."
            />
            <button type="submit" className="btn btn-primary mt-2 w-100">Set Start</button>
          </form>
        </div>

        <div className="col-md-2 d-flex align-items-center justify-content-center">
          <button onClick={handleSwap} className="btn btn-secondary">Swap</button>
        </div>

        <div className="col-md-5 mb-2">
          <form onSubmit={(event) => handleSearch(event, setDestinationPosition)}>
            <input
              type="text"
              name="search"
              className="form-control"
              placeholder="Destination..."
            />
            <button type="submit" className="btn btn-success mt-2 w-100">Set Destination</button>
          </form>
        </div>
      </div>

      {error && <p className="text-danger text-center">{error}</p>}

      <div className="row mb-3">
        <div className="col text-center">
          <button onClick={handleSum} className="btn btn-warning">Sum Coordinates</button>
        </div>
      </div>

      <MapContainer center={startPosition} zoom={5} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {startPosition && <Marker position={startPosition}></Marker>}
        {destinationPosition[0] !== 0 && <Marker position={destinationPosition}></Marker>}
        {destinationPosition[0] !== 0 && (
          <RoutingMachine start={startPosition} destination={destinationPosition} />
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
