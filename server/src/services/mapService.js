import { SRI_LANKA_LOCATIONS } from '../config/constants.js';

export class MapService {
  constructor() {
    this.provider = process.env.MAP_PROVIDER || 'mock';
    this.apiKey = process.env.MAP_API_KEY || '';
  }

  // Calculate distance in kilometers between two lat/lng coordinates (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Earth's radius in km
    const dLat = this._deg2rad(lat2 - lat1);
    const dLon = this._deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this._deg2rad(lat1)) *
        Math.cos(this._deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  _deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  // Find location details from Sri Lankan database
  findLocation(cityName) {
    if (!cityName) return null;
    const normalized = cityName.toLowerCase().trim();
    const found = SRI_LANKA_LOCATIONS.find((loc) =>
      loc.city.toLowerCase().includes(normalized) ||
      loc.district.toLowerCase() === normalized
    );
    return (
      found || {
        city: cityName,
        district: 'Western',
        province: 'Western',
        lat: 6.9271,
        lng: 79.8612
      }
    );
  }

  getSuggestedLocations(query = '') {
    if (!query || query.trim() === '') {
      return SRI_LANKA_LOCATIONS.slice(0, 10);
    }
    const q = query.toLowerCase();
    return SRI_LANKA_LOCATIONS.filter(
      (loc) => loc.city.toLowerCase().includes(q) || loc.district.toLowerCase().includes(q)
    );
  }
}

export default new MapService();
