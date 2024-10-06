import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Fixing marker icons for leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIconRetina,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

var icon_col = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to handle click and place marker
const LocationMarker = ({ position, setPosition }: { position: L.LatLng | null; setPosition: React.Dispatch<React.SetStateAction<L.LatLng | null>> }) => {
  useMapEvent('click', (event) => {
    setPosition(event.latlng); // Directly update position on map click
  });

  return position === null ? null : (
    <Marker position={position} icon={icon_col}>
      <Popup>
        Latitude: {position.lat}, Longitude: {position.lng}
      </Popup>
    </Marker>
  );
};

// Main MapComponent
const MapComponent = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [loading, setLoading] = useState(false); // For loading state during submission
  const [responseData, setResponseData] = useState<any>(null); // State to hold the response data

  // Function to send data to the backend
  const sendCoordinatesToBackend = async () => {
    if (!position || !startDate || !endDate) {
      alert('Please select a marker, start date, and end date.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/location/find-grid/', { // Adjust this URL to your actual Django endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: position.lat,
          longitude: position.lng,
          start_date: startDate.toISOString().slice(0, 10), // Format to yyyy-mm-dd
          end_date: endDate.toISOString().slice(0, 10),     // Format to yyyy-mm-dd
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResponseData(data); // Store the response data
        console.log('Path:', data.path, 'Row:', data.row);
        alert('Data submitted successfully!');
      } else {
        console.error('Error:', data.error);
        alert('Error submitting data.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
      alert('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      {/* Map Container */}
      <div style={{ height: '60%', width: '60%' }}>
        <MapContainer
          center={[9.235, 76.487]} // Initial center
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {/* Marker placement on map click */}
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>

      {/* Date Picker Inputs */}
      <div style={{ marginTop: '20px', marginBottom: '20px', textAlign: 'center', width:'100%', display:'flex', justifyContent:'space-between' }}>
        <label>
          Start Date: 
          <DatePicker
            selected={startDate}
            onChange={(date: Date | null) => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
          />
        </label>
        <label style={{ marginLeft: '20px' }}>
          End Date: 
          <DatePicker
            selected={endDate}
            onChange={(date: Date | null) => setEndDate(date)}
            dateFormat="yyyy-MM-dd"
          />
        </label>
      </div>

      {/* Submit Button */}
      <button onClick={sendCoordinatesToBackend} disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>

      {/* Display JSON Response Data */}
      {responseData && Array.isArray(responseData) && (
    <div style={{ marginTop: '20px', width: '100%', textAlign: 'center' }}>
    <h3>Response from Server:</h3>
    {responseData.map((link: string, index: number) => (
      <div key={index} style={{ marginBottom: '10px' }}>
        <a href={link} target="_blank" rel="noopener noreferrer">
          {link}
            </a>
        </div>
        ))}
    </div>
    )}
    </div>
  );
};

export default MapComponent;
