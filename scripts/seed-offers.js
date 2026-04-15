require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/diagnostic-lab';

const offerSchema = new mongoose.Schema({
  text: String,
  icon: String,
  color: String,
  priority: Number,
  isActive: Boolean,
  validFrom: Date,
  validUntil: Date,
}, { timestamps: true });

const Offer = mongoose.model('Offer', offerSchema);

const offers = [
  {
    text: "10% OFF on All Blood Tests",
    icon: "Percent",
    color: "text-teal-400",
    priority: 100,
    isActive: true,
    validFrom: new Date(),
    validUntil: null,
  },
  {
    text: "Free Home Collection on Orders Above ₹500",
    icon: "Gift",
    color: "text-cyan-400",
    priority: 90,
    isActive: true,
    validFrom: new Date(),
    validUntil: null,
  },
  {
    text: "Complete Health Checkup Package - ₹999 Only",
    icon: "Sparkles",
    color: "text-amber-400",
    priority: 85,
    isActive: true,
    validFrom: new Date(),
    validUntil: null,
  },
  {
    text: "Same Day Reports Available",
    icon: "Clock",
    color: "text-violet-400",
    priority: 80,
    isActive: true,
    validFrom: new Date(),
    validUntil: null,
  },
  {
    text: "15% OFF on Diabetes Panel",
    icon: "Star",
    color: "text-pink-400",
    priority: 75,
    isActive: true,
    validFrom: new Date(),
    validUntil: null,
  },
  {
    text: "Flat 20% OFF on Cardiac Risk Panel",
    icon: "Percent",
    color: "text-emerald-400",
    priority: 70,
    isActive: true,
    validFrom: new Date(),
    validUntil: null,
  },
  {
    text: "Buy 2 Tests, Get 1 Free on Select Tests",
    icon: "Gift",
    color: "text-orange-400",
    priority: 65,
    isActive: true,
    validFrom: new Date(),
    validUntil: null,
  },
  {
    text: "Women's Health Package - Special Price ₹1499",
    icon: "Sparkles",
    color: "text-rose-400",
    priority: 60,
    isActive: true,
    validFrom: new Date(),
    validUntil: null,
  },
  {
    text: "24/7 Online Booking Available",
    icon: "Clock",
    color: "text-blue-400",
    priority: 55,
    isActive: true,
    validFrom: new Date(),
    validUntil: null,
  },
  {
    text: "Senior Citizen Discount - 25% OFF",
    icon: "Star",
    color: "text-indigo-400",
    priority: 50,
    isActive: true,
    validFrom: new Date(),
    validUntil: null,
  },
];

async function seedOffers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing offers
    await Offer.deleteMany({});
    console.log('🗑️  Cleared existing offers');

    // Insert new offers
    const created = await Offer.insertMany(offers);
    console.log(`✅ Created ${created.length} offers`);

    console.log('\n📊 Offers Summary:');
    created.forEach((offer, i) => {
      console.log(`  ${i + 1}. ${offer.text} (Priority: ${offer.priority})`);
    });

    console.log('\n✨ Offers seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding offers:', error);
    process.exit(1);
  }
}

seedOffers();
