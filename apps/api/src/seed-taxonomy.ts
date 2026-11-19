import { PrismaClient, CategoryType } from '@prisma/client';

export async function seedTaxonomy(prisma: PrismaClient) {
  const categoriesData = [
    // DOMESTIC
    {
      code: 'COOK',
      nameEn: 'Cook / Chef',
      nameUr: 'باورچی / شیف',
      categoryType: CategoryType.DOMESTIC,
      skills: [
        { code: 'COOK_PAKISTANI', nameEn: 'Pakistani Cuisine', nameUr: 'پاکستانی کھانے' },
        { code: 'COOK_CONTINENTAL', nameEn: 'Continental Cuisine', nameUr: 'کانٹینینٹل کھانے' },
        { code: 'COOK_BAKING', nameEn: 'Baking & Desserts', nameUr: 'بیکنگ اور میٹھے' },
        { code: 'COOK_HYGIENE', nameEn: 'Food Hygiene & Storage', nameUr: 'صفائی اور تحفظ خوراک' },
      ],
    },
    {
      code: 'HOUSE_CLEANER',
      nameEn: 'House Cleaner / Maid',
      nameUr: 'گھریلو ملازم / صفائی',
      categoryType: CategoryType.DOMESTIC,
      skills: [
        { code: 'CLEAN_DEEP', nameEn: 'Deep Cleaning', nameUr: 'گہری صفائی' },
        { code: 'CLEAN_LAUNDRY', nameEn: 'Laundry & Ironing', nameUr: 'دھلائی اور استری' },
        { code: 'CLEAN_KITCHEN', nameEn: 'Kitchen & Utensils', nameUr: 'باورچی خانہ صفائی' },
        { code: 'CLEAN_FLOOR', nameEn: 'Floor Polishing & Mopping', nameUr: 'فرش پالش اور پونچھا' },
      ],
    },
    {
      code: 'DRIVER',
      nameEn: 'Chauffeur / Driver',
      nameUr: 'ڈرائیور',
      categoryType: CategoryType.DOMESTIC,
      skills: [
        { code: 'DRV_CITY', nameEn: 'City & Traffic Driving', nameUr: 'شہری ڈرائیونگ' },
        { code: 'DRV_HIGHWAY', nameEn: 'Highway & Intercity Driving', nameUr: 'ہائی وے ڈرائیونگ' },
        { code: 'DRV_MAINT', nameEn: 'Basic Vehicle Maintenance', nameUr: 'گاڑی کی دیکھ بھال' },
        { code: 'DRV_NAV', nameEn: 'GPS & Route Navigation', nameUr: 'راستوں کی پہچان' },
      ],
    },
    {
      code: 'CARETAKER',
      nameEn: 'Caretaker / Nanny',
      nameUr: 'دیکھ بھال / آیا',
      categoryType: CategoryType.DOMESTIC,
      skills: [
        { code: 'CARE_CHILD', nameEn: 'Child Care & Babysitting', nameUr: 'بچوں کی دیکھ بھال' },
        { code: 'CARE_ELDERLY', nameEn: 'Elderly Assistance', nameUr: 'بزرگوں کی نگہداشت' },
        { code: 'CARE_FIRSTAID', nameEn: 'Basic First Aid', nameUr: 'ابتدائی طبی امداد' },
      ],
    },
    {
      code: 'GARDENER',
      nameEn: 'Gardener / Mali',
      nameUr: 'مالی',
      categoryType: CategoryType.DOMESTIC,
      skills: [
        { code: 'GARD_LAWN', nameEn: 'Lawn Mowing & Care', nameUr: 'گھاس اور لان کی دیکھ بھال' },
        { code: 'GARD_PRUNING', nameEn: 'Plant Pruning & Grafting', nameUr: 'پودوں کی تراش خراش' },
        { code: 'GARD_IRRIGATION', nameEn: 'Watering & Irrigation', nameUr: 'آبپاشی کا نظام' },
      ],
    },

    // SKILLED_TRADE
    {
      code: 'ELECTRICIAN',
      nameEn: 'Electrician',
      nameUr: 'الیکٹریشن',
      categoryType: CategoryType.SKILLED_TRADE,
      skills: [
        { code: 'ELEC_WIRING', nameEn: 'Building & House Wiring', nameUr: 'گھریلو وائرنگ' },
        { code: 'ELEC_SOLAR', nameEn: 'Solar & Inverter Installation', nameUr: 'سولر پینل اور انورٹر' },
        { code: 'ELEC_BREAKER', nameEn: 'Distribution Board & Breakers', nameUr: 'ڈی بی باکس اور بریکر' },
        { code: 'ELEC_APPLIANCE', nameEn: 'Appliance Repair', nameUr: 'گھریلو برقی آلات کی مرمت' },
        { code: 'ELEC_3PHASE', nameEn: '3-Phase Industrial Wiring', nameUr: 'تھری فیز صنعتی وائرنگ' },
      ],
    },
    {
      code: 'PLUMBER',
      nameEn: 'Plumber',
      nameUr: 'پلمبر',
      categoryType: CategoryType.SKILLED_TRADE,
      skills: [
        { code: 'PLUMB_PIPE', nameEn: 'PPRC & PVC Pipe Fitting', nameUr: 'پائپ فٹنگ' },
        { code: 'PLUMB_LEAK', nameEn: 'Leak Detection & Repair', nameUr: 'لیکج کی مرمت' },
        { code: 'PLUMB_SANITARY', nameEn: 'Sanitary & Bathroom Fitting', nameUr: 'سینیٹری کی تنصیب' },
        { code: 'PLUMB_MOTOR', nameEn: 'Water Pump / Motor Repair', nameUr: 'پانی کی موٹر کی مرمت' },
        { code: 'PLUMB_GEYSER', nameEn: 'Geyser Installation & Servicing', nameUr: 'گیزر تنصیب اور مرمت' },
      ],
    },
    {
      code: 'MASON',
      nameEn: 'Mason / Mistri',
      nameUr: 'مستری / راج',
      categoryType: CategoryType.SKILLED_TRADE,
      skills: [
        { code: 'MAS_BRICK', nameEn: 'Bricklaying & Masonry', nameUr: 'اینٹوں کی چنائی' },
        { code: 'MAS_PLASTER', nameEn: 'Cement Plastering', nameUr: 'پلستر کا کام' },
        { code: 'MAS_TILE', nameEn: 'Tile & Marble Installation', nameUr: 'ٹائل اور ماربل لگانا' },
        { code: 'MAS_CONCRETE', nameEn: 'Concrete & Foundation Work', nameUr: 'لینٹر اور کنکریٹ' },
      ],
    },
    {
      code: 'CARPENTER',
      nameEn: 'Carpenter',
      nameUr: 'بڑھئی / کارپینٹر',
      categoryType: CategoryType.SKILLED_TRADE,
      skills: [
        { code: 'CARP_DOOR', nameEn: 'Door & Window Installation', nameUr: 'دروازے اور کھڑکیاں' },
        { code: 'CARP_CABINET', nameEn: 'Kitchen & Wardrobe Cabinets', nameUr: 'کابینہ اور الماریاں' },
        { code: 'CARP_POLISH', nameEn: 'Wood Polishing & Varnish', nameUr: 'لکڑی پالش اور وارنش' },
        { code: 'CARP_FURNITURE', nameEn: 'Furniture Repair & Making', nameUr: 'فرنیچر مرمت اور تیاری' },
      ],
    },
    {
      code: 'PAINTER',
      nameEn: 'Painter',
      nameUr: 'پینٹر',
      categoryType: CategoryType.SKILLED_TRADE,
      skills: [
        { code: 'PAINT_WALL', nameEn: 'Interior Wall Painting', nameUr: 'اندرونی دیوار کا رنگ' },
        { code: 'PAINT_WEATHER', nameEn: 'Exterior Weather-Shield', nameUr: 'ویدر شیٹ بیرونی پینٹ' },
        { code: 'PAINT_TEXTURE', nameEn: 'Rockwall & Texture Paint', nameUr: 'ٹیکسچر اور وال پیپر' },
        { code: 'PAINT_DISTEMPER', nameEn: 'Distemper & Plastic Emulsion', nameUr: 'ڈسٹیمپر اور ایملشن' },
      ],
    },
    {
      code: 'WELDER',
      nameEn: 'Welder / Fabricator',
      nameUr: 'ویلڈر',
      categoryType: CategoryType.SKILLED_TRADE,
      skills: [
        { code: 'WELD_ARC', nameEn: 'Electric Arc Welding', nameUr: 'الیکٹرک آرک ویلڈنگ' },
        { code: 'WELD_GAS', nameEn: 'Gas Cutting & Brazing', nameUr: 'گیس کٹنگ' },
        { code: 'WELD_GATE', nameEn: 'Steel Gates & Grills', nameUr: 'لوہے کے گیٹ اور جنگلے' },
      ],
    },

    // INDUSTRIAL
    {
      code: 'HVAC_TECH',
      nameEn: 'HVAC / AC Technician',
      nameUr: 'اے سی ٹیکنیشن',
      categoryType: CategoryType.INDUSTRIAL,
      skills: [
        { code: 'AC_INSTALL', nameEn: 'Split AC Installation', nameUr: 'اسپلٹ اے سی تنصیب' },
        { code: 'AC_GAS', nameEn: 'Gas Refilling & Leak Test', nameUr: 'گیس ری فلنگ' },
        { code: 'AC_COMPRESSOR', nameEn: 'Compressor Repair & Replacement', nameUr: 'کمپریسر تبدیلی اور مرمت' },
        { code: 'AC_SERVICE', nameEn: 'General Servicing & Wash', nameUr: 'جنرل سروس اور صفائی' },
      ],
    },
  ];

  for (const catData of categoriesData) {
    const category = await prisma.category.upsert({
      where: { code: catData.code },
      update: {
        nameEn: catData.nameEn,
        nameUr: catData.nameUr,
        categoryType: catData.categoryType,
      },
      create: {
        code: catData.code,
        nameEn: catData.nameEn,
        nameUr: catData.nameUr,
        categoryType: catData.categoryType,
      },
    });

    for (const skillData of catData.skills) {
      await prisma.skill.upsert({
        where: { code: skillData.code },
        update: {
          nameEn: skillData.nameEn,
          nameUr: skillData.nameUr,
          categoryId: category.id,
        },
        create: {
          code: skillData.code,
          nameEn: skillData.nameEn,
          nameUr: skillData.nameUr,
          categoryId: category.id,
        },
      });
    }
  }

  const catCount = await prisma.category.count();
  const skillCount = await prisma.skill.count();
  return { categories: catCount, skills: skillCount };
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedTaxonomy(prisma)
    .then(res => {
      console.log(`Seeded taxonomy: ${res.categories} categories, ${res.skills} skills`);
      process.exit(0);
    })
    .catch(err => {
      console.error('Error seeding taxonomy:', err);
      process.exit(1);
    });
}
