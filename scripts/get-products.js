const fs = require('fs');
const path = require('path');

// Read .env file manually
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key] = value;
    }
  });
}

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment variables');
  process.exit(1);
}

// Simple Product schema
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
}, { collection: 'products' });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

async function getAllProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const products = await Product.find({}, 'name description')
      .sort({ name: 1 })
      .lean();
    
    console.log('\n=== PRODUCTS IN DATABASE ===\n');
    
    if (products.length === 0) {
      console.log('No products found in the database.');
      return;
    }
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. NAME: ${product.name}`);
      console.log(`   DESCRIPTION: ${product.description || 'No description available'}`);
      console.log('');
    });
    
    console.log(`Total products: ${products.length}\n`);
    
  } catch (error) {
    console.error('Error fetching products:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

getAllProducts();