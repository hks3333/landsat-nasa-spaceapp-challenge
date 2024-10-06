import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

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
    shadowSize: [41, 41]
  });

// Component to handle click and place marker
const LocationMarker = () => {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  useMapEvent('click', (event) => {
    setPosition(event.latlng); // Update position on map click
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
  return (
    <div style={{ height: '100vh', width: '100%', display:'flex', justifyContent:'center', alignItems:'center' }}>
      <MapContainer
        center={[51.505, -0.09]} // Initial center
        zoom={13}
        style={{ height: '60%', width: '60%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {/* Marker placement on map click */}
        <LocationMarker />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
