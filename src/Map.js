import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

// Initialize the OpenStreetMap provider
const provider = new OpenStreetMapProvider();

const MapComponent = () => {
  // Set the default location to India
  const [position, setPosition] = useState([20.5937, 78.9629]); // Default location: India
  const [error, setError] = useState('');

  // Handle the search form submission
  const handleSearch = async (event) => {
    event.preventDefault(); // Prevent form from submitting normally
    const query = event.target.elements.search.value.trim(); // Get the input value and trim whitespace

    // Check if the input is not empty
    if (!query) {
      setError('Please enter a location');
      return;
    }

    try {
      // Perform the search query using the geosearch provider
      const results = await provider.search({ query });

      // Check if results are returned and update the map position
      if (results.length > 0) {
        const { x, y } = results[0]; // Longitude (x) and Latitude (y)
        setPosition([y, x]); // Update the state with new coordinates
        setError(''); // Clear any previous errors
      } else {
        setError('No results found. Please try a different query.');
      }
    } catch (err) {
      setError('Error fetching location. Please try again later.');
    }
  };

  return (
    <div>
      {/* Search form */}
      <form onSubmit={handleSearch}>
        <input
          type="text"
          name="search"
          placeholder="Search for places..."
          style={{
            width: '240px',
            height: '30px',
            padding: '5px',
            marginBottom: '10px',
          }}
        />
        <button type="submit">Search</button>
      </form>

      {/* Display any error messages */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Leaflet map container */}
      <MapContainer center={position} zoom={5} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {/* Marker for the searched location */}
        <Marker position={position}></Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent;
