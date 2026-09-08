import { ROLES, TRANSMISSION_TYPE, VERIFICATION_STATUS, BOOKING_STATUS, PAYMENT_STATUS } from '../config/constants.js';

export const categoriesData = [
  {
    name: 'Home Services',
    slug: 'home-services',
    description: 'Trusted technicians for plumbing, electrical work, AC repairs, and carpentry.',
    icon: 'Wrench',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
    featured: true,
    sortOrder: 1,
    subcategories: [
      { name: 'Plumbing', slug: 'plumbing', description: 'Pipe leaks, taps, bathroom fitting' },
      { name: 'Electrical', slug: 'electrical', description: 'Wiring, circuit breakers, lighting' },
      { name: 'AC Repair & Service', slug: 'ac-repair', description: 'AC servicing, gas refills, repairs' },
      { name: 'Carpentry', slug: 'carpentry', description: 'Furniture repair, door locks, woodwork' },
      { name: 'Painting', slug: 'painting', description: 'Interior and exterior house painting' }
    ]
  },
  {
    name: 'Drive My Vehicle',
    slug: 'drive-my-vehicle',
    description: 'Hire verified professional drivers to drive your own car, SUV, or van across Sri Lanka.',
    icon: 'Car',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80',
    featured: true,
    sortOrder: 2,
    subcategories: [
      { name: 'Personal Driver', slug: 'personal-driver', description: 'Daily, hourly, or full-day personal driver' },
      { name: 'Airport Transfers', slug: 'airport-transfers', description: 'Driver to drive your car to/from BIA Katunayake' },
      { name: 'Night Driving', slug: 'night-driving', description: 'Safe return driver after social events or late work' },
      { name: 'Long-Distance Travel', slug: 'long-distance', description: 'Outstation trips across Sri Lanka in your vehicle' },
      { name: 'Wedding & Events', slug: 'wedding-events', description: 'Experienced drivers for ceremonial vehicles' }
    ]
  },
  {
    name: 'Vehicle Care & Repair',
    slug: 'vehicle-care',
    description: 'Mobile mechanics, auto-electricians, and doorstep car wash & detailing.',
    icon: 'Hammer',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
    featured: true,
    sortOrder: 3,
    subcategories: [
      { name: 'Mobile Mechanic', slug: 'mobile-mechanic', description: 'On-site vehicle breakdown & diagnostics' },
      { name: 'Auto Electrical', slug: 'auto-electrical', description: 'Battery, wiring, starter motor fixes' },
      { name: 'Car Detailing & Wash', slug: 'car-detailing', description: 'Doorstep interior & exterior deep cleaning' }
    ]
  },
  {
    name: 'Cleaning & Housekeeping',
    slug: 'cleaning',
    description: 'Deep house cleaning, sofa shampooing, water tank cleaning, and sanitization.',
    icon: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80',
    featured: true,
    sortOrder: 4,
    subcategories: [
      { name: 'Deep Home Cleaning', slug: 'deep-cleaning', description: 'Comprehensive room and kitchen cleaning' },
      { name: 'Sofa & Carpet Cleaning', slug: 'sofa-carpet-cleaning', description: 'Upholstery stain extraction' },
      { name: 'Water Tank Cleaning', slug: 'water-tank', description: 'Disinfection of overhead and sump tanks' }
    ]
  },
  {
    name: 'Education & Tutoring',
    slug: 'education',
    description: 'Expert home and online tutors for O/L, A/L, languages, and coding.',
    icon: 'GraduationCap',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    featured: false,
    sortOrder: 5,
    subcategories: [
      { name: 'School Syllabus (O/L & A/L)', slug: 'school-syllabus', description: 'Maths, Science, Commerce' },
      { name: 'English & Languages', slug: 'languages', description: 'Spoken English, IELTS, Japanese' },
      { name: 'Coding & IT Tutors', slug: 'coding-tutor', description: 'Python, Web development, ICT' }
    ]
  },
  {
    name: 'Technology & IT Support',
    slug: 'technology',
    description: 'Laptop repair, Wi-Fi network setup, CCTV camera installation, and smart home setup.',
    icon: 'Laptop',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    featured: true,
    sortOrder: 6,
    subcategories: [
      { name: 'Computer & Laptop Repair', slug: 'computer-repair', description: 'Hardware repair, Windows, SSD upgrades' },
      { name: 'Wi-Fi & Home Networking', slug: 'networking', description: 'Router setup, mesh Wi-Fi, cabling' },
      { name: 'CCTV Camera Setup', slug: 'cctv-setup', description: 'Security cameras and remote viewing' }
    ]
  },
  {
    name: 'Events & Photography',
    slug: 'events',
    description: 'Wedding and event photographers, videographers, decorators, and caterers.',
    icon: 'Camera',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    featured: false,
    sortOrder: 7,
    subcategories: [
      { name: 'Event Photography', slug: 'photography', description: 'Birthdays, corporate events, ceremonies' },
      { name: 'Videography & Drone', slug: 'videography', description: '4K video footage and reels' },
      { name: 'Party Decor & Sound', slug: 'party-decor', description: 'Lighting, balloons, sound systems' }
    ]
  },
  {
    name: 'Moving & Transport',
    slug: 'moving',
    description: 'House relocation, furniture movers, packing assistance, and lorry transport.',
    icon: 'Truck',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    featured: false,
    sortOrder: 8,
    subcategories: [
      { name: 'House Relocation', slug: 'house-relocation', description: 'Packing, loading, transport, and unloading' },
      { name: 'Heavy Item Moving', slug: 'heavy-items', description: 'Fridges, safes, pianos, wardrobes' },
      { name: 'Packing & Boxes', slug: 'packing-service', description: 'Bubble wrap, cartons, disassembly' }
    ]
  },
  {
    name: 'Gardening & Landscaping',
    slug: 'gardening',
    description: 'Lawn mowing, tree trimming, garden maintenance, and landscaping.',
    icon: 'Trees',
    image: 'https://images.unsplash.com/photo-1558904541-efa8c4a52d31?auto=format&fit=crop&w=800&q=80',
    featured: false,
    sortOrder: 9,
    subcategories: [
      { name: 'Grass Cutting & Trimming', slug: 'grass-cutting', description: 'Lawn mower maintenance' },
      { name: 'Tree Trimming', slug: 'tree-trimming', description: 'Branch cutting and coconut plucking' },
      { name: 'Garden Landscaping', slug: 'landscaping', description: 'Planting, turfing, paved pathways' }
    ]
  },
  {
    name: 'Beauty & Personal Care',
    slug: 'beauty',
    description: 'At-home salon, hair styling, bridal dressing, and massage therapy.',
    icon: 'Scissors',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    featured: false,
    sortOrder: 10,
    subcategories: [
      { name: 'Home Haircut & Styling', slug: 'haircut', description: 'Men and women styling at home' },
      { name: 'Facials & Skincare', slug: 'facials', description: 'Organic facials and cleanups' },
      { name: 'Bridal Dressing', slug: 'bridal', description: 'Kandyan and western bridal packages' }
    ]
  }
];

export const servicesData = [
  {
    title: 'Emergency Plumbing Repair & Leak Fix',
    categorySlug: 'home-services',
    subcategory: 'Plumbing',
    description: 'Rapid on-site repair for leaking pipes, broken faucets, clogged toilets, and overhead water tanks.',
    pricingType: 'fixed',
    basePrice: 2500,
    estimatedDurationMinutes: 90,
    popular: true,
    icon: 'Wrench'
  },
  {
    title: 'Complete AC Service & Chemical Wash',
    categorySlug: 'home-services',
    subcategory: 'AC Repair & Service',
    description: 'Deep filter cleaning, outdoor blower washing, refrigerant gas check, and cooling optimization.',
    pricingType: 'fixed',
    basePrice: 4000,
    estimatedDurationMinutes: 120,
    popular: true,
    icon: 'Wind'
  },
  {
    title: 'Electrical Troubleshooting & Rewiring',
    categorySlug: 'home-services',
    subcategory: 'Electrical',
    description: 'Diagnose tripped circuit breakers, short circuits, switch replacement, and main distribution board repair.',
    pricingType: 'hourly',
    basePrice: 1800,
    estimatedDurationMinutes: 60,
    popular: true,
    icon: 'Zap'
  },
  {
    title: 'Interior House Painting (Per Room)',
    categorySlug: 'home-services',
    subcategory: 'Painting',
    description: 'Surface preparation, primer coat, and two coats of premium emulsion paint with neat cleanup.',
    pricingType: 'quote_based',
    basePrice: 8500,
    estimatedDurationMinutes: 480,
    popular: false,
    icon: 'Paintbrush'
  },
  {
    title: 'Door Locks & Furniture Woodworking Repair',
    categorySlug: 'home-services',
    subcategory: 'Carpentry',
    description: 'Fix sticking doors, replace mortise locks, wardrobe hinges, and dining chair re-gluing.',
    pricingType: 'fixed',
    basePrice: 3000,
    estimatedDurationMinutes: 120,
    popular: false,
    icon: 'Hammer'
  },
  {
    title: 'Hire a Personal Driver (Hourly / As-Needed)',
    categorySlug: 'drive-my-vehicle',
    subcategory: 'Personal Driver',
    description: 'Hire an experienced, verified professional driver to drive your personal car for short errands or meetings.',
    pricingType: 'hourly',
    basePrice: 1200,
    estimatedDurationMinutes: 180,
    popular: true,
    icon: 'Car'
  },
  {
    title: 'Airport Transfer in Your Own Car (BIA Katunayake)',
    categorySlug: 'drive-my-vehicle',
    subcategory: 'Airport Transfers',
    description: 'A reliable driver drives your vehicle to or from Bandaranaike International Airport and returns it safely to your garage.',
    pricingType: 'fixed',
    basePrice: 4500,
    estimatedDurationMinutes: 180,
    popular: true,
    icon: 'Plane'
  },
  {
    title: 'Night Driving & Safe Return Service',
    categorySlug: 'drive-my-vehicle',
    subcategory: 'Night Driving',
    description: 'Enjoy your evening without worry. A sober, background-verified driver drives you and your car home safely.',
    pricingType: 'fixed',
    basePrice: 3800,
    estimatedDurationMinutes: 150,
    popular: true,
    icon: 'Moon'
  },
  {
    title: 'Full-Day Outstation Driver for Family Trip',
    categorySlug: 'drive-my-vehicle',
    subcategory: 'Long-Distance Travel',
    description: 'Relax with your family while our professional driver handles highway and hill country driving in your SUV or van.',
    pricingType: 'fixed',
    basePrice: 8500,
    estimatedDurationMinutes: 600,
    popular: true,
    icon: 'Navigation'
  },
  {
    title: 'Doorstep Mobile Auto Mechanic & Diagnostics',
    categorySlug: 'vehicle-care',
    subcategory: 'Mobile Mechanic',
    description: 'Computerized OBD-II engine scan, brake pad inspection, oil leak detection, and on-site repair at your home.',
    pricingType: 'fixed',
    basePrice: 3500,
    estimatedDurationMinutes: 120,
    popular: true,
    icon: 'Cpu'
  },
  {
    title: 'Doorstep Premium Car Detailing & Interior Wash',
    categorySlug: 'vehicle-care',
    subcategory: 'Car Detailing & Wash',
    description: 'Waterless foam wash, machine wax buffing, interior vacuuming, leather conditioning, and windshield glass treatment.',
    pricingType: 'fixed',
    basePrice: 6500,
    estimatedDurationMinutes: 240,
    popular: true,
    icon: 'Sparkles'
  },
  {
    title: 'Full House Deep Cleaning & Sanitization',
    categorySlug: 'cleaning',
    subcategory: 'Deep Home Cleaning',
    description: 'Comprehensive cleaning of living rooms, bedrooms, tile floor scrubbing, window cleaning, and cobweb removal.',
    pricingType: 'quote_based',
    basePrice: 12000,
    estimatedDurationMinutes: 360,
    popular: true,
    icon: 'Sparkles'
  },
  {
    title: 'Sofa & Fabric Upholstery Shampoo Extraction',
    categorySlug: 'cleaning',
    subcategory: 'Sofa & Carpet Cleaning',
    description: 'Steam injection and vacuum extraction for 5-seater sofa set removing stubborn dust and stains.',
    pricingType: 'fixed',
    basePrice: 5500,
    estimatedDurationMinutes: 150,
    popular: false,
    icon: 'Layers'
  },
  {
    title: 'Laptop Hardware Repair & SSD Upgrade',
    categorySlug: 'technology',
    subcategory: 'Computer & Laptop Repair',
    description: 'Speed up sluggish laptops with fast NVMe/SATA SSD installation, thermal paste repasting, and OS optimization.',
    pricingType: 'fixed',
    basePrice: 4000,
    estimatedDurationMinutes: 90,
    popular: true,
    icon: 'Laptop'
  },
  {
    title: 'Home Wi-Fi Mesh Network & Speed Optimization',
    categorySlug: 'technology',
    subcategory: 'Wi-Fi & Home Networking',
    description: 'Eliminate dead zones across multiple floors with mesh router configuration, ethernet cat6 cabling, and SLT fiber tuning.',
    pricingType: 'fixed',
    basePrice: 4500,
    estimatedDurationMinutes: 120,
    popular: false,
    icon: 'Wifi'
  },
  {
    title: 'CCTV 4-Camera Installation & Mobile App Setup',
    categorySlug: 'technology',
    subcategory: 'CCTV Camera Setup',
    description: 'Mounting cameras, running outdoor weather-shield cables, DVR setup, and live streaming to your smartphone.',
    pricingType: 'quote_based',
    basePrice: 14000,
    estimatedDurationMinutes: 420,
    popular: true,
    icon: 'Eye'
  },
  {
    title: 'Private O/L & A/L Mathematics Home Tutoring',
    categorySlug: 'education',
    subcategory: 'School Syllabus (O/L & A/L)',
    description: 'Experienced graduate teacher providing individual theory, past paper revisions, and exam technique coaching.',
    pricingType: 'hourly',
    basePrice: 2000,
    estimatedDurationMinutes: 120,
    popular: false,
    icon: 'BookOpen'
  },
  {
    title: 'House Moving Assistance & Loading Helpers',
    categorySlug: 'moving',
    subcategory: 'House Relocation',
    description: 'Two energetic helpers for safe lifting, protective wrapping, and vehicle loading/unloading.',
    pricingType: 'fixed',
    basePrice: 7500,
    estimatedDurationMinutes: 240,
    popular: false,
    icon: 'Truck'
  },
  {
    title: 'Lawn Mowing & Yard Garden Clearance',
    categorySlug: 'gardening',
    subcategory: 'Grass Cutting & Trimming',
    description: 'Brush cutter grass mowing, hedge trimming, weeding, and green waste bag collection.',
    pricingType: 'fixed',
    basePrice: 3500,
    estimatedDurationMinutes: 180,
    popular: false,
    icon: 'Scissors'
  },
  {
    title: 'Bridal & Party Hair and Makeup Styling at Home',
    categorySlug: 'beauty',
    subcategory: 'Bridal Dressing',
    description: 'Professional beautician visits your home for hair styling, high-definition makeup, and saree draping.',
    pricingType: 'fixed',
    basePrice: 9000,
    estimatedDurationMinutes: 150,
    popular: false,
    icon: 'Heart'
  }
];
