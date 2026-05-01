import { useState, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

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
    
    const startNativeTracking = async () => {
      try {
        const hasPermission = await Geolocation.checkPermissions();
        if (hasPermission.location !== 'granted') {
           const req = await Geolocation.requestPermissions();
           if (req.location !== 'granted') {
              setError("Location permission denied");
              return;
           }
        }
        watchId = await Geolocation.watchPosition({ enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }, (pos, err) => {
            if (err) {
               setError(err.message);
               return;
            }
            if (pos) {
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
                  return prev; 
                }
                return { lat, lng }; 
              });
            }
        });
      } catch (err) {
         setError(err.message);
      }
    };

    if (isTracking) {
      if (Capacitor.isNativePlatform()) {
         startNativeTracking();
      } else if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setLocation({ lat, lng });
            setError(null);
            
            setLastPoint((prev) => {
              if (prev) {
                const dist = calculateDistance(prev.lat, prev.lng, lat, lng);
                if (dist > 0.005) {
                  setDistanceKm(d => d + dist);
                  return { lat, lng };
                }
                return prev;
              }
              return { lat, lng };
            });
          },
          (err) => {
            setError(err.message);
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
      }
    }

    return () => {
      if (watchId) {
        if (Capacitor.isNativePlatform()) {
           Geolocation.clearWatch({ id: watchId }).catch(e => console.error(e));
        } else {
           navigator.geolocation.clearWatch(watchId);
        }
      }
    };
  }, [isTracking]);

  const startTracking = () => {
    setIsTracking(true);
    setDistanceKm(0); 
    setLastPoint(null);
  };
  
  const stopTracking = () => {
    setIsTracking(false);
  };

  const steps = Math.floor(distanceKm * 1300);

  return { location, isTracking, distanceKm, steps, error, startTracking, stopTracking };
}
