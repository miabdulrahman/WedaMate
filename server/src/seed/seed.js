import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { connectDB, closeDB } from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Service from '../models/Service.js';
import ProviderProfile from '../models/ProviderProfile.js';
import DriverProfile from '../models/DriverProfile.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import Vehicle from '../models/Vehicle.js';
import PlatformSettings from '../models/PlatformSettings.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';

import { categoriesData, servicesData } from './seedData.js';
import {
  ROLES,
  TRANSMISSION_TYPE,
  VERIFICATION_STATUS,
  BOOKING_STATUS,
  PAYMENT_STATUS
} from '../config/constants.js';

export const seedDatabase = async () => {
  try {
    console.log('🌱 [WedaMate Seeder] Initializing database seeding...');
    await connectDB();

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Service.deleteMany({}),
      ProviderProfile.deleteMany({}),
      DriverProfile.deleteMany({}),
      Booking.deleteMany({}),
      Review.deleteMany({}),
      Vehicle.deleteMany({}),
      PlatformSettings.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
      Notification.deleteMany({})
    ]);

    console.log('🧹 Cleared existing database records.');

    // 1. Platform Settings
    const settings = await PlatformSettings.create({
      commissionPercentage: 10,
      baseServiceFee: 250,
      driverHourlyMinRate: 800,
      driverHalfDayMinRate: 3500,
      driverFullDayMinRate: 7000,
      emergencySurchargePercentage: 15
    });
    console.log('⚙️  Created platform settings.');

    // 2. Categories
    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`📂 Seeded ${createdCategories.length} categories.`);

    const categoryMap = {};
    createdCategories.forEach((c) => {
      categoryMap[c.slug] = c._id;
    });

    // 3. Services
    const preparedServices = servicesData.map((s) => ({
      title: s.title,
      slug: s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: categoryMap[s.categorySlug],
      subcategory: s.subcategory,
      description: s.description,
      pricingType: s.pricingType,
      basePrice: s.basePrice,
      estimatedDurationMinutes: s.estimatedDurationMinutes,
      popular: s.popular,
      icon: s.icon
    }));

    const createdServices = await Service.insertMany(preparedServices);
    console.log(`🛠️  Seeded ${createdServices.length} marketplace services.`);

    // 4. Create Core Demo Accounts
    // 4a. Admin
    const adminUser = await User.create({
      name: 'WedaMate Admin',
      email: 'admin@wedamate.local',
      password: 'admin123',
      role: ROLES.ADMIN,
      phone: '+94 11 200 8000',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      address: { city: 'Colombo', district: 'Colombo', street: 'Galle Face Terrace', lat: 6.9271, lng: 79.8612 }
    });

    // 4b. Demo Customer
    const demoCustomer = await User.create({
      name: 'Kasun Perera',
      email: 'customer@wedamate.local',
      password: 'customer123',
      role: ROLES.CUSTOMER,
      phone: '+94 77 123 4567',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300',
      address: { city: 'Negombo', district: 'Gampaha', street: '45 Porutota Road', lat: 7.2008, lng: 79.8737 }
    });

    // Seed vehicles for demo customer
    const customerVehicle1 = await Vehicle.create({
      user: demoCustomer._id,
      nickname: 'Daily Prius',
      vehicleType: 'car',
      brand: 'Toyota',
      model: 'Prius 4th Gen',
      year: 2019,
      transmission: 'automatic',
      registrationNumber: 'WP CAB-8492',
      isDefault: true
    });

    const customerVehicle2 = await Vehicle.create({
      user: demoCustomer._id,
      nickname: 'Family Outstation Van',
      vehicleType: 'van',
      brand: 'Toyota',
      model: 'KDH HiAce Super GL',
      year: 2017,
      transmission: 'automatic',
      registrationNumber: 'WP PB-3410',
      isDefault: false
    });

    // 4c. Demo Provider (Plumber)
    const demoProviderUser = await User.create({
      name: 'Kamal Senanayake',
      email: 'provider@wedamate.local',
      password: 'provider123',
      role: ROLES.PROVIDER,
      phone: '+94 71 892 3411',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
      address: { city: 'Negombo', district: 'Gampaha', street: '12 Main Street', lat: 7.2008, lng: 79.8737 }
    });

    const demoProviderProfile = await ProviderProfile.create({
      user: demoProviderUser._id,
      businessName: 'Negombo Premier Plumbing & Repairs',
      profession: 'Master Plumber & Pipe Technician',
      bio: 'Over 14 years of certified plumbing experience in Negombo, Katunayake, and Ja-Ela. Specializes in emergency leak repairs, pressure pumps, and bathroom fittings.',
      categories: [categoryMap['home-services']],
      subcategories: ['Plumbing', 'Carpentry'],
      serviceAreas: [
        { city: 'Negombo', district: 'Gampaha' },
        { city: 'Katunayake', district: 'Gampaha' },
        { city: 'Ja-Ela', district: 'Gampaha' },
        { city: 'Wattala', district: 'Gampaha' }
      ],
      startingPrice: 2500,
      rating: 4.9,
      reviewCount: 38,
      jobsCompleted: 142,
      completionRate: 99,
      responseTimeMinutes: 10,
      languages: ['Sinhala', 'English'],
      verificationStatus: VERIFICATION_STATUS.VERIFIED,
      badges: ['Verified Professional', 'Verified Identity', 'Top Rated', 'WedaMate Recommended'],
      featured: true
    });

    demoProviderUser.providerProfile = demoProviderProfile._id;
    await demoProviderUser.save();

    // 4d. Demo Driver for "Drive My Vehicle"
    const demoDriverUser = await User.create({
      name: 'Bandara Warnakulasuriya',
      email: 'driver@wedamate.local',
      password: 'driver123',
      role: ROLES.DRIVER,
      phone: '+94 76 554 9912',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
      address: { city: 'Negombo', district: 'Gampaha', street: '88 Sea Street', lat: 7.2008, lng: 79.8737 }
    });

    const demoDriverProfile = await DriverProfile.create({
      user: demoDriverUser._id,
      drivingExperienceYears: 12,
      transmissionSkills: TRANSMISSION_TYPE.BOTH,
      vehicleCategoriesCanDrive: ['Car', 'SUV', 'Van', 'Pickup'],
      serviceAreas: [
        { city: 'Negombo', district: 'Gampaha' },
        { city: 'Katunayake', district: 'Gampaha' },
        { city: 'Colombo', district: 'Colombo' },
        { city: 'Ja-Ela', district: 'Gampaha' }
      ],
      hourlyRate: 1200,
      halfDayRate: 5000,
      fullDayRate: 9000,
      specialties: [
        'Experienced highway driver',
        'Airport Transfers (BIA Katunayake)',
        'Night driving & safe return',
        'Long-distance experience',
        'Elderly passenger assistance',
        'Wedding & VIP event driving'
      ],
      licenseNumber: 'B-749210-WP',
      licenseVerificationStatus: VERIFICATION_STATUS.VERIFIED,
      rating: 4.9,
      drivingSkillScore: 4.9,
      punctualityScore: 5.0,
      reviewCount: 46,
      completedJobs: 184,
      cancellationRate: 1,
      responseTimeMinutes: 5,
      languages: ['Sinhala', 'English', 'Italian'],
      verificationBadges: ['Verified Driver', 'Verified Identity', 'Top Rated', 'WedaMate Recommended'],
      isAvailable: true,
      bio: 'Former executive chauffeur with 12 years accident-free record. Proficient with European cars, hybrid Japanese automatics, and heavy manual vans. Punctual, courteous, and polite.'
    });

    demoDriverUser.driverProfile = demoDriverProfile._id;
    await demoDriverUser.save();

    console.log('👤 Created core demo accounts: Admin, Customer, Provider, Driver.');

    // 5. Create 10+ Additional Customers
    const customerNames = [
      { name: 'Dilshan Fernando', city: 'Colombo 03 (Kollupitiya)', district: 'Colombo' },
      { name: 'Nadeesha Silva', city: 'Kelaniya', district: 'Gampaha' },
      { name: 'Chaminda Wickramasinghe', city: 'Wattala', district: 'Gampaha' },
      { name: 'Ishara Jayawardena', city: 'Colombo 07 (Cinnamon Gardens)', district: 'Colombo' },
      { name: 'Malith Gunasekara', city: 'Ja-Ela', district: 'Gampaha' },
      { name: 'Sanduni Ranasinghe', city: 'Panadura', district: 'Kalutara' },
      { name: 'Thisara Alwis', city: 'Katunayake', district: 'Gampaha' },
      { name: 'Hiruni Samarasinghe', city: 'Gampaha', district: 'Gampaha' },
      { name: 'Roshan Senanayake', city: 'Mount Lavinia', district: 'Colombo' },
      { name: 'Dinuka Rajapaksha', city: 'Minuwangoda', district: 'Gampaha' },
      { name: 'Kavindi Weerasinghe', city: 'Dehiwala', district: 'Colombo' }
    ];

    const customerUsers = [demoCustomer];
    for (let i = 0; i < customerNames.length; i++) {
      const c = customerNames[i];
      const u = await User.create({
        name: c.name,
        email: `customer${i + 2}@wedamate.local`,
        password: 'password123',
        role: ROLES.CUSTOMER,
        phone: `+94 77 ${1000000 + i * 4321}`,
        avatar: `https://images.unsplash.com/photo-${1500000000000 + i * 12345}?auto=format&fit=crop&q=80&w=300`,
        address: { city: c.city, district: c.district, street: 'Residential Lane', lat: 6.9271, lng: 79.8612 }
      });
      customerUsers.push(u);

      // Add a vehicle for several customers
      if (i % 2 === 0) {
        await Vehicle.create({
          user: u._id,
          nickname: 'Personal Car',
          vehicleType: i % 4 === 0 ? 'suv' : 'car',
          brand: i % 4 === 0 ? 'Honda' : 'Toyota',
          model: i % 4 === 0 ? 'Vezel' : 'Axio',
          year: 2018 + (i % 5),
          transmission: i % 3 === 0 ? 'manual' : 'automatic',
          registrationNumber: `WP CP-${1200 + i}`,
          isDefault: true
        });
      }
    }
    console.log(`👥 Created ${customerUsers.length} total customer accounts.`);

    // 6. Create 15+ Additional Providers
    const providerProfilesData = [
      {
        name: 'Sunil Jayasuriya',
        email: 'provider.sunil@wedamate.local',
        city: 'Colombo (Fort / Central)',
        district: 'Colombo',
        businessName: 'Spark Electrical & Engineering',
        profession: 'Licensed Electrician & Solar Installer',
        category: 'home-services',
        subcategories: ['Electrical'],
        price: 2000,
        rating: 4.8,
        reviews: 29,
        jobs: 94
      },
      {
        name: 'Pradeep Mendis',
        email: 'provider.pradeep@wedamate.local',
        city: 'Wattala',
        district: 'Gampaha',
        businessName: 'Arctic Breeze AC Solutions',
        profession: 'Certified AC Technician',
        category: 'home-services',
        subcategories: ['AC Repair & Service'],
        price: 3500,
        rating: 4.9,
        reviews: 42,
        jobs: 130
      },
      {
        name: 'Niroshan De Silva',
        email: 'provider.niroshan@wedamate.local',
        city: 'Gampaha',
        district: 'Gampaha',
        businessName: 'PureClean Pro Sri Lanka',
        profession: 'Deep House & Tank Cleaning Specialist',
        category: 'cleaning',
        subcategories: ['Deep Home Cleaning', 'Water Tank Cleaning'],
        price: 8000,
        rating: 4.7,
        reviews: 21,
        jobs: 67
      },
      {
        name: 'Ajith Bandara',
        email: 'provider.ajith@wedamate.local',
        city: 'Panadura',
        district: 'Kalutara',
        businessName: 'Western Precision Painters',
        profession: 'Master House & Commercial Painter',
        category: 'home-services',
        subcategories: ['Painting'],
        price: 7000,
        rating: 4.9,
        reviews: 33,
        jobs: 88
      },
      {
        name: 'Ranjan Perera',
        email: 'provider.ranjan@wedamate.local',
        city: 'Ja-Ela',
        district: 'Gampaha',
        businessName: 'Lanka Mobile Auto Mechanics',
        profession: 'Automobile Diagnostics & Mechanic',
        category: 'vehicle-care',
        subcategories: ['Mobile Mechanic', 'Auto Electrical'],
        price: 3500,
        rating: 4.8,
        reviews: 26,
        jobs: 74
      },
      {
        name: 'Nuwan Kumara',
        email: 'provider.nuwan@wedamate.local',
        city: 'Kelaniya',
        district: 'Gampaha',
        businessName: 'Kelaniya Tech & Network Solutions',
        profession: 'IT Technician & CCTV Specialist',
        category: 'technology',
        subcategories: ['Computer & Laptop Repair', 'CCTV Camera Setup'],
        price: 3000,
        rating: 4.9,
        reviews: 35,
        jobs: 110
      },
      {
        name: 'Anuradha Wijesinghe',
        email: 'provider.anuradha@wedamate.local',
        city: 'Colombo 07 (Cinnamon Gardens)',
        district: 'Colombo',
        businessName: 'Apex Academic Tutoring',
        profession: 'A/L & O/L Mathematics & Physics Tutor',
        category: 'education',
        subcategories: ['School Syllabus (O/L & A/L)'],
        price: 2200,
        rating: 5.0,
        reviews: 18,
        jobs: 50
      },
      {
        name: 'Sajith Karunaratne',
        email: 'provider.sajith@wedamate.local',
        city: 'Negombo',
        district: 'Gampaha',
        businessName: 'Cinnamon Coast Photography',
        profession: 'Event & Wedding Photographer',
        category: 'events',
        subcategories: ['Event Photography', 'Videography & Drone'],
        price: 15000,
        rating: 4.9,
        reviews: 31,
        jobs: 62
      },
      {
        name: 'Dhammika Fernando',
        email: 'provider.dhammika@wedamate.local',
        city: 'Dehiwala',
        district: 'Colombo',
        businessName: 'QuickShift Movers & Transport',
        profession: 'House Relocation & Heavy Item Mover',
        category: 'moving',
        subcategories: ['House Relocation', 'Heavy Item Moving'],
        price: 7500,
        rating: 4.7,
        reviews: 24,
        jobs: 83
      },
      {
        name: 'Chandana Kumara',
        email: 'provider.chandana@wedamate.local',
        city: 'Katunayake',
        district: 'Gampaha',
        businessName: 'GreenLeaf Landscaping & Tree Care',
        profession: 'Gardener & Landscape Designer',
        category: 'gardening',
        subcategories: ['Grass Cutting & Trimming', 'Garden Landscaping'],
        price: 3500,
        rating: 4.6,
        reviews: 15,
        jobs: 49
      },
      {
        name: 'Shalini Jayawardena',
        email: 'provider.shalini@wedamate.local',
        city: 'Mount Lavinia',
        district: 'Colombo',
        businessName: 'Glamour Doorstep Salon & Bridal',
        profession: 'Certified Beautician & Hair Stylist',
        category: 'beauty',
        subcategories: ['Home Haircut & Styling', 'Bridal Dressing'],
        price: 6000,
        rating: 4.9,
        reviews: 27,
        jobs: 78
      },
      {
        name: 'Mahesh Fonseka',
        email: 'provider.mahesh@wedamate.local',
        city: 'Minuwangoda',
        district: 'Gampaha',
        businessName: 'MasterCraft Carpentry',
        profession: 'Furniture & Lock Specialist',
        category: 'home-services',
        subcategories: ['Carpentry'],
        price: 2800,
        rating: 4.8,
        reviews: 19,
        jobs: 55
      },
      {
        name: 'Supun Jayasinghe',
        email: 'provider.supun@wedamate.local',
        city: 'Negombo',
        district: 'Gampaha',
        businessName: 'Doorstep Sparkle Car Wash',
        profession: 'Mobile Car Detailing Specialist',
        category: 'vehicle-care',
        subcategories: ['Car Detailing & Wash'],
        price: 5500,
        rating: 4.8,
        reviews: 22,
        jobs: 70
      },
      {
        name: 'Rohan Dissanayake',
        email: 'provider.rohan@wedamate.local',
        city: 'Colombo 03 (Kollupitiya)',
        district: 'Colombo',
        businessName: 'ProNet Wi-Fi & Fibre Solutions',
        profession: 'Network Engineer & Wi-Fi Specialist',
        category: 'technology',
        subcategories: ['Wi-Fi & Home Networking'],
        price: 4500,
        rating: 4.9,
        reviews: 30,
        jobs: 92
      }
    ];

    const providerUsers = [demoProviderUser];
    for (const p of providerProfilesData) {
      const u = await User.create({
        name: p.name,
        email: p.email,
        password: 'password123',
        role: ROLES.PROVIDER,
        phone: '+94 77 981 2233',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
        address: { city: p.city, district: p.district, street: 'Commercial Road', lat: 6.9271, lng: 79.8612 }
      });

      const profile = await ProviderProfile.create({
        user: u._id,
        businessName: p.businessName,
        profession: p.profession,
        bio: `Trusted local specialist in ${p.city} and Western Province. Highly rated for professionalism and prompt service.`,
        categories: [categoryMap[p.category] || categoryMap['home-services']],
        subcategories: p.subcategories,
        serviceAreas: [
          { city: p.city, district: p.district },
          { city: 'Colombo', district: 'Colombo' },
          { city: 'Negombo', district: 'Gampaha' }
        ],
        startingPrice: p.price,
        rating: p.rating,
        reviewCount: p.reviews,
        jobsCompleted: p.jobs,
        completionRate: 98,
        responseTimeMinutes: 12,
        languages: ['Sinhala', 'English'],
        verificationStatus: VERIFICATION_STATUS.VERIFIED,
        badges: ['Verified Professional', 'Verified Identity'],
        featured: p.rating >= 4.9
      });

      u.providerProfile = profile._id;
      await u.save();
      providerUsers.push(u);
    }
    console.log(`👷 Created ${providerUsers.length} verified service providers.`);

    // 7. Create 8+ Specialized Drivers for "Drive My Vehicle"
    const driverProfilesData = [
      {
        name: 'Priyantha Jayasundara',
        email: 'driver.priyantha@wedamate.local',
        city: 'Colombo 03 (Kollupitiya)',
        district: 'Colombo',
        years: 9,
        transmission: TRANSMISSION_TYPE.AUTOMATIC,
        hourly: 1300,
        halfDay: 5500,
        fullDay: 10000,
        rating: 4.9,
        jobs: 140,
        specialties: ['Night driving & safe return', 'VIP / Executive driving', 'Elderly passenger assistance']
      },
      {
        name: 'Sanjeewa Weerakkody',
        email: 'driver.sanjeewa@wedamate.local',
        city: 'Gampaha',
        district: 'Gampaha',
        years: 15,
        transmission: TRANSMISSION_TYPE.BOTH,
        hourly: 1100,
        halfDay: 4800,
        fullDay: 8500,
        rating: 4.9,
        jobs: 210,
        specialties: ['Experienced highway driver', 'Long-distance outstation', 'Family van specialist']
      },
      {
        name: 'Ruwan Wickramarachchi',
        email: 'driver.ruwan@wedamate.local',
        city: 'Katunayake',
        district: 'Gampaha',
        years: 8,
        transmission: TRANSMISSION_TYPE.AUTOMATIC,
        hourly: 1200,
        halfDay: 5000,
        fullDay: 9000,
        rating: 4.8,
        jobs: 125,
        specialties: ['Airport Transfers (BIA Katunayake)', 'Experienced highway driver', 'Night driving']
      },
      {
        name: 'Chathura Ratnayake',
        email: 'driver.chathura@wedamate.local',
        city: 'Panadura',
        district: 'Kalutara',
        years: 10,
        transmission: TRANSMISSION_TYPE.BOTH,
        hourly: 1200,
        halfDay: 5000,
        fullDay: 8800,
        rating: 4.8,
        jobs: 95,
        specialties: ['Wedding & VIP event driving', 'Southern Expressway', 'Multi-stop errands']
      },
      {
        name: 'Anura Dassanayake',
        email: 'driver.anura@wedamate.local',
        city: 'Dehiwala',
        district: 'Colombo',
        years: 11,
        transmission: TRANSMISSION_TYPE.BOTH,
        hourly: 1250,
        halfDay: 5200,
        fullDay: 9200,
        rating: 4.9,
        jobs: 160,
        specialties: ['Night driving & safe return', 'Elderly passenger care', 'Medical appointments']
      },
      {
        name: 'Dinesh Gunawardena',
        email: 'driver.dinesh@wedamate.local',
        city: 'Kelaniya',
        district: 'Gampaha',
        years: 6,
        transmission: TRANSMISSION_TYPE.AUTOMATIC,
        hourly: 1000,
        halfDay: 4200,
        fullDay: 7800,
        rating: 4.7,
        jobs: 75,
        specialties: ['City errands & shopping', 'Automatic car specialist', 'Office commutes']
      },
      {
        name: 'Lasantha Hettiarachchi',
        email: 'driver.lasantha@wedamate.local',
        city: 'Ja-Ela',
        district: 'Gampaha',
        years: 14,
        transmission: TRANSMISSION_TYPE.BOTH,
        hourly: 1350,
        halfDay: 5800,
        fullDay: 10500,
        rating: 5.0,
        jobs: 175,
        specialties: ['High-end luxury vehicles', 'Kandy & Hill Country driving', 'Highway expert']
      },
      {
        name: 'Pradeep Kulatunga',
        email: 'driver.pradeep@wedamate.local',
        city: 'Wattala',
        district: 'Gampaha',
        years: 7,
        transmission: TRANSMISSION_TYPE.MANUAL,
        hourly: 1100,
        halfDay: 4500,
        fullDay: 8200,
        rating: 4.8,
        jobs: 82,
        specialties: ['Manual transmission specialist', 'Commercial pickups & vans', 'Long-distance']
      }
    ];

    const driverUsers = [demoDriverUser];
    for (const d of driverProfilesData) {
      const u = await User.create({
        name: d.name,
        email: d.email,
        password: 'password123',
        role: ROLES.DRIVER,
        phone: '+94 76 991 8822',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
        address: { city: d.city, district: d.district, street: 'Driver Residence', lat: 6.9271, lng: 79.8612 }
      });

      const profile = await DriverProfile.create({
        user: u._id,
        drivingExperienceYears: d.years,
        transmissionSkills: d.transmission,
        vehicleCategoriesCanDrive: ['Car', 'SUV', 'Van'],
        serviceAreas: [
          { city: d.city, district: d.district },
          { city: 'Colombo', district: 'Colombo' },
          { city: 'Negombo', district: 'Gampaha' }
        ],
        hourlyRate: d.hourly,
        halfDayRate: d.halfDay,
        fullDayRate: d.fullDay,
        specialties: d.specialties,
        licenseNumber: `B-${Math.floor(100000 + Math.random() * 900000)}-WP`,
        licenseVerificationStatus: VERIFICATION_STATUS.VERIFIED,
        rating: d.rating,
        drivingSkillScore: d.rating,
        punctualityScore: 5.0,
        reviewCount: Math.round(d.jobs / 4),
        completedJobs: d.jobs,
        cancellationRate: 1,
        responseTimeMinutes: 8,
        languages: ['Sinhala', 'English'],
        verificationBadges: ['Verified Driver', 'Verified Identity', 'Top Rated'],
        isAvailable: true,
        bio: `Professional licensed chauffeur with ${d.years} years of reliable driving experience. Very familiar with Sri Lankan highways, Colombo traffic, and coastal routes.`
      });

      u.driverProfile = profile._id;
      await u.save();
      driverUsers.push(u);
    }
    console.log(`🚗 Created ${driverUsers.length} specialized Drive My Vehicle drivers.`);

    // 8. Create 30+ Bookings spanning services and drivers
    console.log('📅 Generating realistic bookings across service & driver categories...');

    const statuses = [
      BOOKING_STATUS.COMPLETED,
      BOOKING_STATUS.COMPLETED,
      BOOKING_STATUS.COMPLETED,
      BOOKING_STATUS.CONFIRMED,
      BOOKING_STATUS.IN_PROGRESS,
      BOOKING_STATUS.ACCEPTED,
      BOOKING_STATUS.PENDING,
      BOOKING_STATUS.CANCELLED
    ];

    const createdBookings = [];

    // Create 15 regular service bookings
    for (let i = 0; i < 16; i++) {
      const customer = customerUsers[i % customerUsers.length];
      const provider = providerUsers[i % providerUsers.length];
      const service = createdServices[i % createdServices.length];
      const status = statuses[i % statuses.length];

      const price = service.basePrice;
      const commission = Math.round(price * 0.1);
      const baseFee = 250;
      const totalAmount = price + baseFee;
      const providerEarnings = price - commission;

      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + (i - 8)); // Some past, some upcoming

      const b = await Booking.create({
        customer: customer._id,
        provider: provider._id,
        bookingType: 'service',
        service: service._id,
        serviceSnapshot: {
          title: service.title,
          categoryName: 'Home Services',
          pricingType: service.pricingType,
          unitPrice: service.basePrice
        },
        location: {
          address: '42 Galle Road',
          city: customer.address.city || 'Negombo',
          district: customer.address.district || 'Gampaha'
        },
        scheduledDate,
        startTime: '09:30',
        durationHours: 2,
        price,
        additionalFees: 0,
        platformFee: commission + baseFee,
        totalAmount,
        providerEarnings,
        paymentStatus: status === BOOKING_STATUS.COMPLETED ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PENDING,
        status,
        notes: 'Please arrive on time. The main gate will be unlocked.',
        statusTimeline: [
          { status: BOOKING_STATUS.PENDING, timestamp: new Date(scheduledDate.getTime() - 86400000), note: 'Booking placed' },
          { status, timestamp: new Date(), note: `Updated to ${status}` }
        ]
      });
      createdBookings.push(b);
    }

    // Create 15 "Drive My Vehicle" bookings
    for (let i = 0; i < 16; i++) {
      const customer = customerUsers[(i + 2) % customerUsers.length];
      const driver = driverUsers[i % driverUsers.length];
      const status = statuses[(i + 3) % statuses.length];

      const price = 4800; // ~4 hours or half day
      const commission = Math.round(price * 0.1);
      const baseFee = 250;
      const totalAmount = price + baseFee;
      const providerEarnings = price - commission;

      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + (i - 7));

      const b = await Booking.create({
        customer: customer._id,
        provider: driver._id,
        bookingType: 'driver',
        driverDetails: {
          vehicleType: i % 2 === 0 ? 'car' : 'suv',
          transmission: i % 3 === 0 ? 'manual' : 'automatic',
          vehicleRegistration: `WP CAQ-${1000 + i}`,
          vehicleNickname: 'Owner Vehicle',
          driverRequirements: ['Experienced highway driver', 'Night driving'],
          additionalStops: ['Airport Roundabout', 'Ja-Ela Highway Exit'],
          pickupLocation: {
            address: '74 Beach Road',
            city: 'Negombo',
            district: 'Gampaha'
          },
          destinationLocation: {
            address: 'Bandaranaike International Airport',
            city: 'Katunayake',
            district: 'Gampaha'
          },
          recurringAgreement: false,
          rateType: 'hourly'
        },
        location: {
          address: '74 Beach Road, Negombo',
          city: 'Negombo',
          district: 'Gampaha'
        },
        scheduledDate,
        startTime: '14:00',
        durationHours: 4,
        price,
        additionalFees: 0,
        platformFee: commission + baseFee,
        totalAmount,
        providerEarnings,
        paymentStatus: status === BOOKING_STATUS.COMPLETED ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PENDING,
        status,
        notes: 'Heading to BIA Katunayake airport for flight arrival. Need safe driving in our Honda Vezel.',
        statusTimeline: [
          { status: BOOKING_STATUS.PENDING, timestamp: new Date(scheduledDate.getTime() - 86400000), note: 'Drive My Vehicle requested' },
          { status, timestamp: new Date(), note: `Updated to ${status}` }
        ]
      });
      createdBookings.push(b);
    }
    console.log(`📋 Seeded ${createdBookings.length} total realistic bookings.`);

    // 9. Create 20+ Reviews for completed bookings
    const completedBookings = createdBookings.filter((b) => b.status === BOOKING_STATUS.COMPLETED);
    console.log(`⭐ Creating reviews for completed jobs...`);

    const reviewComments = [
      'Outstanding work! Arrived 5 minutes early, resolved our leak quickly, and cleaned up after. Highly recommend Kamal!',
      'Handled my automatic SUV with great care on the highway. Very calm and polite driver. Will book again!',
      'Great AC service! Chemical wash made our unit run ice cold like brand new. Very reasonable pricing.',
      'Drove our family to Katunayake airport in our own van safely and returned the car cleanly parked in our garage. Top notch service!',
      'Very neat electrical rewiring. Explained everything clearly before starting the work. 5 stars!',
      'Hired for a full day outstation trip to Kandy. Handled steep curves with total confidence. Felt completely safe.',
      'Prompt mobile mechanic service. Diagnosed the alternator problem at our driveway and fixed it within two hours.',
      'Super reliable night return driver after our office get-together. Peace of mind is priceless!',
      'Deep house cleaning was thorough and left the bathrooms sparkling clean. Courteous team.',
      'Friendly and professional driving. Punctual, respectful, and safe driver.'
    ];

    for (let i = 0; i < completedBookings.length; i++) {
      const b = completedBookings[i];
      const comment = reviewComments[i % reviewComments.length];

      await Review.create({
        customer: b.customer,
        provider: b.provider,
        booking: b._id,
        rating: 5,
        comment,
        subRatings: {
          quality: 5,
          professionalism: 5,
          communication: 5,
          punctuality: 5,
          value: 5,
          drivingSkill: b.bookingType === 'driver' ? 5 : undefined,
          safety: b.bookingType === 'driver' ? 5 : undefined
        }
      });

      b.hasReview = true;
      await b.save();
    }
    console.log(`🌟 Seeded reviews with complete rating breakdowns.`);

    console.log('================================================================');
    console.log('🎉 WedaMate seed dataset created successfully!');
    console.log('================================================================');
    console.log('DEMO ACCOUNTS READY:');
    console.log('👑 Admin:    admin@wedamate.local    / admin123');
    console.log('👤 Customer: customer@wedamate.local / customer123');
    console.log('👷 Provider: provider@wedamate.local / provider123');
    console.log('🚗 Driver:   driver@wedamate.local   / driver123');
    console.log('================================================================');
  } catch (err) {
    console.error('❌ Seeder encountered an error:', err);
  }
};

// If run directly from terminal `npm run seed`
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(async () => {
    await closeDB();
    process.exit(0);
  });
}
