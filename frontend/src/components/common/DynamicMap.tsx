import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Issue } from '../../types';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons for different statuses
const statusIcons = {
  pending: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  'in-progress': new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  resolved: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  }),
  rejected: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
};

interface DynamicMapProps {
  issues: Issue[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onIssueClick?: (issue: Issue) => void;
}

// Component to handle map updates
const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

const DynamicMap: React.FC<DynamicMapProps> = ({ 
  issues, 
  center = [22.60500, 72.84500], // Default to Changa village coordinates
  zoom = 13,
  height = '400px',
  onIssueClick 
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Get user's current location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('User location detected:', { latitude, longitude });
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.log('Could not get location:', error);
          // If geolocation fails, use default location
          setMapCenter(center);
        }
      );
    } else {
      // If geolocation not available, use default location
      setMapCenter(center);
    }
  }, [center]);

  // Update center when issues change
  useEffect(() => {
    if (issues.length > 0) {
      const firstIssue = issues[0];
      // Handle both latitude/longitude and lat/lng formats
      const lat = firstIssue.location.lat || firstIssue.location.latitude;
      const lng = firstIssue.location.lng || firstIssue.location.longitude;
      if (lat && lng) {
        console.log('Setting map center to first issue:', { lat, lng });
        setMapCenter([lat, lng]);
      } else {
        console.warn('Invalid location data for first issue:', firstIssue.location);
      }
    }
  }, [issues]);

  const handleMarkerClick = (issue: Issue) => {
    if (onIssueClick) {
      onIssueClick(issue);
    }
  };

  console.log('DynamicMap rendering with:', { 
    issuesCount: issues.length, 
    mapCenter, 
    userLocation,
    firstIssue: issues[0] || null
  });

  return (
    <div style={{ height, width: '100%', minHeight: '400px' }} className="rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={mapCenter} zoom={zoom} />
        
        {/* User location marker */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>
              <div className="text-center">
                <strong>Your Location</strong>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Issue markers */}
        {issues.map((issue) => {
          // Handle both latitude/longitude and lat/lng formats
          const lat = issue.location.lat || issue.location.latitude;
          const lng = issue.location.lng || issue.location.longitude;
          
          if (!lat || !lng) {
            console.warn('Invalid location for issue:', issue.id, issue.location);
            return null;
          }
          
          return (
            <Marker
              key={issue.id}
              position={[lat, lng]}
              icon={statusIcons[issue.status] || statusIcons.pending}
              eventHandlers={{
                click: () => handleMarkerClick(issue)
              }}
            >
              <Popup>
                <div className="max-w-xs">
                  <h3 className="font-medium text-gray-900 mb-2">{issue.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-3">{issue.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`px-2 py-1 rounded-full ${
                      issue.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      issue.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {issue.status.replace('-', ' ')}
                    </span>
                    <span className="text-gray-500">{issue.category}</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    {issue.location.address}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default DynamicMap;
