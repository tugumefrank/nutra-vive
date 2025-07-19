// Script to fix Stripe price IDs after switching to live mode
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Stripe = require('stripe');

// Read .env file manually (following the pattern from other scripts)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim();
        const value = trimmedLine.substring(equalIndex + 1).trim();
        if (key && value) {
          process.env[key] = value;
        }
      }
    }
  });
} else {
  console.error('❌ .env file not found');
  process.exit(1);
}

// Initialize Stripe with live key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Define the membership schema (simplified)
const membershipSchema = new mongoose.Schema({
  name: String,
  tier: String,
  price: Number,
  billingCycle: String,
  stripePriceId: String,
  isActive: Boolean,
});

const Membership = mongoose.model('Membership', membershipSchema);

async function fixStripePrices() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all active memberships
    const memberships = await Membership.find({ isActive: true });
    console.log(`Found ${memberships.length} active memberships`);

    for (const membership of memberships) {
      console.log(`\nProcessing: ${membership.name}`);
      
      try {
        // Create Stripe product
        const product = await stripe.products.create({
          name: `${membership.name} Membership`,
          description: `${membership.tier} tier membership`,
          metadata: {
            membershipId: membership._id.toString(),
            tier: membership.tier,
          },
        });

        console.log(`Created product: ${product.id}`);

        // Create Stripe price
        const price = await stripe.prices.create({
          unit_amount: Math.round(membership.price * 100), // Convert to cents
          currency: 'usd',
          recurring: {
            interval: membership.billingCycle || 'month',
          },
          product: product.id,
          metadata: {
            membershipId: membership._id.toString(),
            tier: membership.tier,
          },
        });

        console.log(`Created price: ${price.id}`);

        // Update membership with new price ID
        await Membership.findByIdAndUpdate(membership._id, {
          stripePriceId: price.id,
        });

        console.log(`✅ Updated ${membership.name} with new price ID: ${price.id}`);

      } catch (error) {
        console.error(`❌ Error processing ${membership.name}:`, error.message);
      }
    }

    console.log('\n✅ All memberships processed!');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
fixStripePrices();