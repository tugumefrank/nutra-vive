// Script to fix membership category ID mismatches
// Run with: node scripts/fix-membership-categories.js

const mongoose = require('mongoose');

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-uri-here';

// Schema definitions (simplified)
const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  isActive: Boolean
});

const UserMembershipSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  membership: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership' },
  status: String,
  productUsage: [{
    categoryId: String,
    categoryName: String,
    allocatedQuantity: Number,
    usedQuantity: Number,
    availableQuantity: Number,
    lastUsed: Date
  }]
});

const Category = mongoose.model('Category', CategorySchema);
const UserMembership = mongoose.model('UserMembership', UserMembershipSchema);

async function fixMembershipCategories() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all current categories
    const categories = await Category.find({ isActive: true });
    console.log('Found categories:', categories.map(c => ({ id: c._id, name: c.name })));

    // Create category name to ID mapping
    const categoryMapping = {};
    categories.forEach(cat => {
      categoryMapping[cat.name.toLowerCase()] = cat._id.toString();
    });

    console.log('Category mapping:', categoryMapping);

    // Get all user memberships with productUsage
    const memberships = await UserMembership.find({ 
      status: 'active',
      productUsage: { $exists: true, $ne: [] }
    });

    console.log(`Found ${memberships.length} active memberships to check`);

    for (const membership of memberships) {
      let updated = false;
      
      for (const usage of membership.productUsage) {
        const currentCategoryName = usage.categoryName.toLowerCase();
        const correctCategoryId = categoryMapping[currentCategoryName];
        
        if (correctCategoryId && usage.categoryId !== correctCategoryId) {
          console.log(`Updating membership ${membership._id}:`);
          console.log(`  - Category: ${usage.categoryName}`);
          console.log(`  - Old ID: ${usage.categoryId}`);
          console.log(`  - New ID: ${correctCategoryId}`);
          
          usage.categoryId = correctCategoryId;
          updated = true;
        }
      }
      
      if (updated) {
        await membership.save();
        console.log(`✅ Updated membership ${membership._id}`);
      }
    }

    console.log('✅ Migration completed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the migration
fixMembershipCategories();