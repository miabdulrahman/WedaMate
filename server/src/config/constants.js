export const ROLES = {
  CUSTOMER: 'customer',
  PROVIDER: 'provider',
  DRIVER: 'driver',
  ADMIN: 'admin'
};

export const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed'
};

export const QUOTE_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  AUTHORIZED: 'authorized',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded'
};

export const VERIFICATION_STATUS = {
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
};

export const TRANSMISSION_TYPE = {
  MANUAL: 'manual',
  AUTOMATIC: 'automatic',
  BOTH: 'both'
};

export const VEHICLE_TYPE = {
  CAR: 'car',
  SUV: 'suv',
  VAN: 'van',
  PICKUP: 'pickup',
  OTHER: 'other'
};

export const DRIVER_RATE_TYPES = {
  HOURLY: 'hourly',
  HALF_DAY: 'half_day',
  FULL_DAY: 'full_day',
  RECURRING: 'recurring',
  CUSTOM: 'custom'
};

export const SRI_LANKA_LOCATIONS = [
  { city: 'Negombo', district: 'Gampaha', province: 'Western', lat: 7.2008, lng: 79.8737 },
  { city: 'Katunayake', district: 'Gampaha', province: 'Western', lat: 7.1687, lng: 79.8887 },
  { city: 'Ja-Ela', district: 'Gampaha', province: 'Western', lat: 7.0744, lng: 79.8913 },
  { city: 'Kandana', district: 'Gampaha', province: 'Western', lat: 7.0478, lng: 79.8972 },
  { city: 'Wattala', district: 'Gampaha', province: 'Western', lat: 6.9895, lng: 79.8924 },
  { city: 'Kelaniya', district: 'Gampaha', province: 'Western', lat: 6.9553, lng: 79.9167 },
  { city: 'Gampaha', district: 'Gampaha', province: 'Western', lat: 7.0840, lng: 79.9943 },
  { city: 'Minuwangoda', district: 'Gampaha', province: 'Western', lat: 7.1667, lng: 79.9500 },
  { city: 'Colombo (Fort / Central)', district: 'Colombo', province: 'Western', lat: 6.9271, lng: 79.8612 },
  { city: 'Colombo 03 (Kollupitiya)', district: 'Colombo', province: 'Western', lat: 6.9038, lng: 79.8519 },
  { city: 'Colombo 07 (Cinnamon Gardens)', district: 'Colombo', province: 'Western', lat: 6.9064, lng: 79.8688 },
  { city: 'Dehiwala', district: 'Colombo', province: 'Western', lat: 6.8517, lng: 79.8653 },
  { city: 'Mount Lavinia', district: 'Colombo', province: 'Western', lat: 6.8378, lng: 79.8631 },
  { city: 'Nugegoda', district: 'Colombo', province: 'Western', lat: 6.8724, lng: 79.8988 },
  { city: 'Maharagama', district: 'Colombo', province: 'Western', lat: 6.8480, lng: 79.9265 },
  { city: 'Kottawa', district: 'Colombo', province: 'Western', lat: 6.8415, lng: 79.9654 },
  { city: 'Battaramulla', district: 'Colombo', province: 'Western', lat: 6.8997, lng: 79.9192 },
  { city: 'Rajagiriya', district: 'Colombo', province: 'Western', lat: 6.9090, lng: 79.8966 },
  { city: 'Panadura', district: 'Kalutara', province: 'Western', lat: 6.7133, lng: 79.9074 },
  { city: 'Kalutara', district: 'Kalutara', province: 'Western', lat: 6.5854, lng: 79.9607 },
  { city: 'Kandy', district: 'Kandy', province: 'Central', lat: 7.2906, lng: 80.6337 },
  { city: 'Galle', district: 'Galle', province: 'Southern', lat: 6.0535, lng: 80.2210 },
  { city: 'Kurunegala', district: 'Kurunegala', province: 'North Western', lat: 7.4863, lng: 80.3623 }
];
