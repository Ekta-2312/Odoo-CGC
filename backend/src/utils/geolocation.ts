import { getDistance } from 'geolib';
import { Location, GeoBounds } from '../types';

/**
 * Calculate distance between two points in kilometers
 */
export const calculateDistance = (
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number => {
  const distance = getDistance(
    { lat: point1.latitude, lon: point1.longitude },
    { lat: point2.latitude, lon: point2.longitude }
  );
  return distance / 1000; // Convert meters to kilometers
};

/**
 * Check if a point is within a specified radius of another point
 */
export const isWithinRadius = (
  center: { latitude: number; longitude: number },
  point: { latitude: number; longitude: number },
  radiusKm: number
): boolean => {
  const distance = calculateDistance(center, point);
  return distance <= radiusKm;
};

/**
 * Generate bounding box coordinates for a given center point and radius
 */
export const generateBoundingBox = (
  center: { latitude: number; longitude: number },
  radiusKm: number
): GeoBounds => {
  // Approximate degrees per kilometer
  const latDegreesPerKm = 1 / 111;
  const lngDegreesPerKm = 1 / (111 * Math.cos(center.latitude * Math.PI / 180));

  const latDelta = radiusKm * latDegreesPerKm;
  const lngDelta = radiusKm * lngDegreesPerKm;

  return {
    north: center.latitude + latDelta,
    south: center.latitude - latDelta,
    east: center.longitude + lngDelta,
    west: center.longitude - lngDelta,
  };
};

/**
 * Validate latitude and longitude values
 */
export const isValidCoordinates = (latitude: number, longitude: number): boolean => {
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

/**
 * Find the center point of multiple locations
 */
export const findCenterPoint = (locations: Location[]): Location => {
  if (locations.length === 0) {
    throw new Error('Cannot find center of empty locations array');
  }

  if (locations.length === 1) {
    const firstLocation = locations[0];
    if (!firstLocation) {
      throw new Error('Invalid location data');
    }
    return firstLocation;
  }

  let totalLat = 0;
  let totalLng = 0;

  locations.forEach(location => {
    totalLat += location.latitude;
    totalLng += location.longitude;
  });

  return {
    latitude: totalLat / locations.length,
    longitude: totalLng / locations.length,
  };
};

/**
 * Format coordinates for display
 */
export const formatCoordinates = (
  latitude: number,
  longitude: number,
  precision: number = 6
): string => {
  return `${latitude.toFixed(precision)}, ${longitude.toFixed(precision)}`;
};

/**
 * Generate a locality string from coordinates (simplified)
 * In a real application, you might use a reverse geocoding service
 */
export const generateLocalityFromCoordinates = (
  latitude: number,
  longitude: number
): string => {
  // This is a simplified implementation
  // In production, you would use a service like Google Maps Geocoding API
  const latGrid = Math.floor(latitude * 100);
  const lngGrid = Math.floor(longitude * 100);
  return `locality_${latGrid}_${lngGrid}`;
};

/**
 * Calculate the area of a bounding box in square kilometers
 */
export const calculateBoundingBoxArea = (bounds: GeoBounds): number => {
  const topLeft = { latitude: bounds.north, longitude: bounds.west };
  const topRight = { latitude: bounds.north, longitude: bounds.east };
  const bottomLeft = { latitude: bounds.south, longitude: bounds.west };

  const width = calculateDistance(topLeft, topRight);
  const height = calculateDistance(topLeft, bottomLeft);

  return width * height;
};
