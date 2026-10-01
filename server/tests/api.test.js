import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, closeDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import DriverProfile from '../src/models/DriverProfile.js';
import ProviderProfile from '../src/models/ProviderProfile.js';
import Booking from '../src/models/Booking.js';
import Service from '../src/models/Service.js';
import Category from '../src/models/Category.js';
import PlatformSettings from '../src/models/PlatformSettings.js';
import { ROLES, BOOKING_STATUS, TRANSMISSION_TYPE } from '../src/config/constants.js';

let customerToken = '';
let customerId = '';
let providerToken = '';
let providerId = '';
let driverToken = '';
let driverId = '';
let adminToken = '';
let testServiceId = '';
let sampleBookingId = '';
let driverBookingId = '';

before(async () => {
  await connectDB();

  // Clear test records
  await User.deleteMany({});
  await ProviderProfile.deleteMany({});
  await DriverProfile.deleteMany({});
  await Booking.deleteMany({});
  await Category.deleteMany({});
  await Service.deleteMany({});
  await PlatformSettings.deleteMany({});

  await PlatformSettings.create({
    commissionPercentage: 10,
    baseServiceFee: 250
  });

  const cat = await Category.create({
    name: 'Home Repairs',
    slug: 'home-repairs',
    icon: 'Wrench'
  });

  const s = await Service.create({
    title: 'Pipe Leakage Repair',
    slug: 'pipe-leakage-repair',
    category: cat._id,
    basePrice: 3000,
    description: 'Fix any pipe leak'
  });
  testServiceId = s._id.toString();
});

after(async () => {
  await closeDB();
});

test('1. Authentication - Register Customer, Provider, Driver, Admin', async () => {
  // Customer registration
  const resCust = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test Customer',
      email: 'testcustomer@wedamate.lk',
      password: 'password123',
      role: ROLES.CUSTOMER,
      city: 'Negombo'
    });

  assert.equal(resCust.status, 201);
  assert.equal(resCust.body.success, true);
  assert.ok(resCust.body.data.token);
  customerToken = resCust.body.data.token;
  customerId = resCust.body.data.user.id;

  // Provider registration
  const resProv = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test Provider',
      email: 'testprovider@wedamate.lk',
      password: 'password123',
      role: ROLES.PROVIDER,
      profession: 'Plumber',
      city: 'Negombo'
    });

  assert.equal(resProv.status, 201);
  assert.equal(resProv.body.success, true);
  assert.ok(resProv.body.data.token);
  providerToken = resProv.body.data.token;
  providerId = resProv.body.data.user.id;

  // Driver registration
  const resDriv = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test Driver',
      email: 'testdriver@wedamate.lk',
      password: 'password123',
      role: ROLES.DRIVER,
      city: 'Negombo'
    });

  assert.equal(resDriv.status, 201);
  assert.equal(resDriv.body.success, true);
  assert.ok(resDriv.body.data.token);
  driverToken = resDriv.body.data.token;
  driverId = resDriv.body.data.user.id;

  // Admin registration
  const resAdmin = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test Admin',
      email: 'testadmin@wedamate.lk',
      password: 'password123',
      role: ROLES.ADMIN,
      city: 'Colombo'
    });

  assert.equal(resAdmin.status, 201);
  adminToken = resAdmin.body.data.token;
});

test('2. Authentication - Login successfully and verify JWT token', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'testcustomer@wedamate.lk',
      password: 'password123'
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.user.email, 'testcustomer@wedamate.lk');
  assert.ok(res.body.data.token);
});

test('3. Authorization - Role guards protect Admin endpoints from Customers', async () => {
  const res = await request(app)
    .get('/api/admin/analytics')
    .set('Authorization', `Bearer ${customerToken}`);

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
});

test('4. Booking Creation - Customer books a service with fee calculation', async () => {
  const scheduledDate = new Date();
  scheduledDate.setDate(scheduledDate.getDate() + 2);

  const res = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({
      providerId,
      bookingType: 'service',
      serviceId: testServiceId,
      scheduledDate: scheduledDate.toISOString(),
      startTime: '10:00',
      durationHours: 2,
      location: {
        address: '15 Ocean Road',
        city: 'Negombo',
        district: 'Gampaha'
      },
      notes: 'Main bathroom pipe issue'
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.booking.price, 3000);
  // Platform fee: 10% commission (300) + baseFee (250) = 550
  assert.equal(res.body.data.booking.platformFee, 550);
  // Total: 3000 + 250 = 3250
  assert.equal(res.body.data.booking.totalAmount, 3250);
  assert.equal(res.body.data.booking.providerEarnings, 2700);
  assert.equal(res.body.data.booking.status, BOOKING_STATUS.PENDING);
  sampleBookingId = res.body.data.booking._id;
});

test('5. Double-Booking Prevention - Rejects overlapping booking on same slot', async () => {
  const scheduledDate = new Date();
  scheduledDate.setDate(scheduledDate.getDate() + 2);

  const res = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({
      providerId,
      bookingType: 'service',
      serviceId: testServiceId,
      scheduledDate: scheduledDate.toISOString(),
      startTime: '10:00', // Conflict with existing booking
      durationHours: 2,
      location: {
        address: '99 Main Road',
        city: 'Negombo',
        district: 'Gampaha'
      }
    });

  assert.equal(res.status, 409);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /already has a scheduled booking/i);
});

test('6. Provider Booking Acceptance & Transition to Completed', async () => {
  // Provider accepts booking
  const resAccept = await request(app)
    .patch(`/api/bookings/${sampleBookingId}/status`)
    .set('Authorization', `Bearer ${providerToken}`)
    .send({
      status: BOOKING_STATUS.ACCEPTED,
      note: 'I will arrive with plumbing tools.'
    });

  assert.equal(resAccept.status, 200);
  assert.equal(resAccept.body.data.booking.status, BOOKING_STATUS.ACCEPTED);

  // Provider marks job completed
  const resComplete = await request(app)
    .patch(`/api/bookings/${sampleBookingId}/status`)
    .set('Authorization', `Bearer ${providerToken}`)
    .send({
      status: BOOKING_STATUS.COMPLETED,
      note: 'Pipe leak successfully repaired.'
    });

  assert.equal(resComplete.status, 200);
  assert.equal(resComplete.body.data.booking.status, BOOKING_STATUS.COMPLETED);
});

test('7. Drive My Vehicle - Dedicated Driver booking with vehicle metadata', async () => {
  const scheduledDate = new Date();
  scheduledDate.setDate(scheduledDate.getDate() + 3);

  const res = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({
      providerId: driverId,
      bookingType: 'driver',
      scheduledDate: scheduledDate.toISOString(),
      startTime: '14:00',
      durationHours: 5,
      driverDetails: {
        vehicleType: 'car',
        transmission: TRANSMISSION_TYPE.AUTOMATIC,
        vehicleRegistration: 'WP CAB-9811',
        vehicleNickname: 'Owner Prius',
        driverRequirements: ['Airport Transfers', 'Experienced highway driver'],
        additionalStops: ['Airport Roundabout'],
        pickupLocation: { address: 'Negombo Town', city: 'Negombo', district: 'Gampaha' },
        destinationLocation: { address: 'BIA Terminal', city: 'Katunayake', district: 'Gampaha' },
        rateType: 'hourly'
      },
      location: {
        address: 'Negombo Town, Sri Lanka',
        city: 'Negombo',
        district: 'Gampaha'
      },
      notes: 'Need safe driving to airport in our personal Prius.'
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.booking.bookingType, 'driver');
  assert.equal(res.body.data.booking.driverDetails.vehicleType, 'car');
  assert.equal(res.body.data.booking.driverDetails.transmission, 'automatic');
  driverBookingId = res.body.data.booking._id;
});

test('8. Reviews - Guard against reviewing incomplete bookings', async () => {
  // driverBookingId is still PENDING, so customer cannot review yet!
  const res = await request(app)
    .post('/api/reviews')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({
      bookingId: driverBookingId,
      rating: 5,
      comment: 'Premature review attempt'
    });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /completed/i);
});

test('9. Reviews - Submit review on completed booking and prevent duplicate', async () => {
  // Review the completed sampleBookingId
  const res = await request(app)
    .post('/api/reviews')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({
      bookingId: sampleBookingId,
      rating: 5,
      comment: 'Excellent service! Solved the leak cleanly.',
      subRatings: {
        quality: 5,
        professionalism: 5,
        communication: 5,
        punctuality: 5,
        value: 5
      }
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);

  // Attempt duplicate review
  const resDup = await request(app)
    .post('/api/reviews')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({
      bookingId: sampleBookingId,
      rating: 4,
      comment: 'Duplicate attempt'
    });

  assert.equal(resDup.status, 409);
  assert.equal(resDup.body.success, false);
});

test('10. Provider Services - Add, update and delete provider services', async () => {
  // Add service
  const resAdd = await request(app)
    .post('/api/providers/services')
    .set('Authorization', `Bearer ${providerToken}`)
    .send({
      title: 'Water Heater Installation',
      price: 4500,
      durationHours: 3,
      description: 'Complete plumbing and electrical connection for solar water heaters'
    });

  assert.equal(resAdd.status, 201);
  assert.equal(resAdd.body.success, true);
  assert.equal(resAdd.body.data.service.title, 'Water Heater Installation');
  const serviceId = resAdd.body.data.service._id;

  // Update service
  const resUpdate = await request(app)
    .put(`/api/providers/services/${serviceId}`)
    .set('Authorization', `Bearer ${providerToken}`)
    .send({
      price: 5000
    });

  assert.equal(resUpdate.status, 200);
  assert.equal(resUpdate.body.success, true);
  assert.equal(resUpdate.body.data.service.price, 5000);

  // Delete service
  const resDelete = await request(app)
    .delete(`/api/providers/services/${serviceId}`)
    .set('Authorization', `Bearer ${providerToken}`);

  assert.equal(resDelete.status, 200);
  assert.equal(resDelete.body.success, true);
});

test('11. Direct Provider Booking - Customer can book provider without passing serviceId', async () => {
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 25);

  const res = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${customerToken}`)
    .send({
      providerId,
      bookingType: 'service',
      scheduledDate: nextMonth.toISOString().split('T')[0],
      startTime: '16:00',
      durationHours: 2,
      location: {
        address: '15 Porutota Road',
        city: 'Negombo',
        district: 'Gampaha'
      },
      notes: 'General plumbing inspection'
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.booking.bookingType, 'service');
  assert.ok(res.body.data.booking.totalAmount > 0);
});

