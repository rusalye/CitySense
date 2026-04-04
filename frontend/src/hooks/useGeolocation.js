import { useState, useEffect } from 'react';

// Haversine formula to calculate distance between two coordinates in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function useGeolocation() {
  const [location, setLocation] = useState(null); // {lat, lng}
  const [isTracking, setIsTracking] = useState(false);
  const [distanceKm, setDistanceKm] = useState(0);
  const [error, setError] = useState(null);
  
  // Keep track of the last point to calculate distance
  const [lastPoint, setLastPoint] = useState(null);

  useEffect(() => {
    let watchId;
    
    if (isTracking && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLocation({ lat, lng });
          setError(null);
          
          setLastPoint((prev) => {
            if (prev) {
              const dist = calculateDistance(prev.lat, prev.lng, lat, lng);
              // Only add if moving more than ~5 meters to prevent GPS jitter drift
              if (dist > 0.005) {
                setDistanceKm(d => d + dist);
                return { lat, lng };
              }
              return prev; // Not moved enough
            }
            return { lat, lng }; // First point
          });
        },
        (err) => {
          setError(err.message);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking]);

  const startTracking = () => {
    setIsTracking(true);
    setDistanceKm(0); // Reset for new walk
    setLastPoint(null);
  };
  
  const stopTracking = () => {
    setIsTracking(false);
  };

  // Convert distance to steps (rough estimate: 1 km = 1300 steps)
  const steps = Math.floor(distanceKm * 1300);

  return { location, isTracking, distanceKm, steps, error, startTracking, stopTracking };
}
