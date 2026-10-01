import Category from '../models/Category.js';
import Service from '../models/Service.js';
import PlatformSettings from '../models/PlatformSettings.js';
import ProviderProfile from '../models/ProviderProfile.js';
import { categoriesData, servicesData } from './seedData.js';

export const ensureInitialData = async () => {
  try {
    console.log('🔍 [Data Check] Verifying essential platform data...');

    // 1. Ensure Platform Settings
    const settingsCount = await PlatformSettings.countDocuments();
    if (settingsCount === 0) {
      await PlatformSettings.create({
        commissionPercentage: 10,
        baseServiceFee: 250,
        driverHourlyMinRate: 800,
        driverHalfDayMinRate: 3500,
        driverFullDayMinRate: 7000,
        emergencySurchargePercentage: 15
      });
      console.log('⚙️  [Data Check] Initialized platform settings.');
    }

    // 2. Ensure Categories (Upsert all 10 Sri Lankan service categories)
    const categoryMap = {};
    for (const cat of categoriesData) {
      let existingCat = await Category.findOne({ slug: cat.slug });
      if (!existingCat) {
        existingCat = await Category.create(cat);
        console.log(`📂 [Data Check] Created category: ${cat.name} (${cat.slug})`);
      }
      categoryMap[cat.slug] = existingCat._id;
      categoryMap[cat.name.toLowerCase()] = existingCat._id;
    }

    const totalCategories = await Category.countDocuments();
    console.log(`✅ [Data Check] Total categories in database: ${totalCategories}`);

    // 3. Ensure Marketplace Catalog Services
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
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

      await Service.insertMany(preparedServices);
      console.log(`🛠️  [Data Check] Seeded ${preparedServices.length} default marketplace services.`);
    }

    // 4. Update Existing Registered Providers with appropriate categories & bookable services
    const homeCat = await Category.findOne({ slug: 'home-services' });
    const gardenCat = await Category.findOne({ slug: 'gardening' });
    const cleanCat = await Category.findOne({ slug: 'cleaning' });
    const vehicleCat = await Category.findOne({ slug: 'vehicle-care' });

    const providers = await ProviderProfile.find({});
    for (const prov of providers) {
      let modified = false;

      // Ensure provider has at least one category assigned
      if (!prov.categories || prov.categories.length === 0) {
        const text = `${prov.profession || ''} ${(prov.subcategories || []).join(' ')} ${prov.bio || ''}`.toLowerCase();
        let targetCat = homeCat;

        if (text.includes('grass') || text.includes('garden') || text.includes('lawn')) {
          targetCat = gardenCat || homeCat;
        } else if (text.includes('clean') || text.includes('wash')) {
          targetCat = cleanCat || homeCat;
        } else if (text.includes('vehicle') || text.includes('mechanic') || text.includes('car')) {
          targetCat = vehicleCat || homeCat;
        }

        if (targetCat) {
          prov.categories = [targetCat._id];
          modified = true;
        }
      }

      // Ensure provider has bookable services
      if (!prov.services || prov.services.length === 0) {
        const catId = prov.categories?.[0] || homeCat?._id;
        const catDoc = await Category.findById(catId);
        const catName = catDoc ? catDoc.name : 'Home Services';

        prov.services = [
          {
            title: prov.profession || 'Standard Service',
            category: catId,
            categoryName: catName,
            description: `Professional ${prov.profession || 'service'} by ${prov.businessName || 'verified expert'}. Reliable and guaranteed quality work.`,
            price: prov.startingPrice || 2500,
            durationHours: 2,
            pricingType: 'fixed',
            isActive: true
          }
        ];
        modified = true;
      }

      if (modified) {
        await prov.save();
        console.log(`👤 [Data Check] Updated provider profile: ${prov.businessName || prov._id} with categories and bookable services.`);
      }
    }

    console.log('✨ [Data Check] Platform data verification complete.');
  } catch (error) {
    console.error('❌ [Data Check Error] Failed during ensureInitialData:', error);
  }
};
