import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const providerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

export default function Map({ 
  userLocation, 
  providerLocation, 
  userLabel = "Your Location",
  providerLabel = "Provider",
  className = "",
  height = "400px"
}) {
  const defaultCenter = userLocation || providerLocation || [37.7749, -122.4194];
  const defaultZoom = 13;

  // Calculate bounds if both locations exist
  const bounds = userLocation && providerLocation 
    ? [userLocation, providerLocation]
    : null;

  return (
    <div className={className} style={{ height, width: '100%', borderRadius: '1rem', overflow: 'hidden' }}>
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        bounds={bounds}
        boundsOptions={{ padding: [50, 50] }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater center={defaultCenter} zoom={defaultZoom} />
        
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">{userLabel}</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {providerLocation && (
          <Marker position={providerLocation} icon={providerIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">{providerLabel}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}