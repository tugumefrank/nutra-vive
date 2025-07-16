const fs = require('fs');
const path = require('path');

// Read .env file manually
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
}

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment variables');
  process.exit(1);
}

// Category schema
const categorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  image: String,
}, { collection: 'categories' });

// Product schema
const productSchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
  shortDescription: String,
  price: Number,
  compareAtPrice: Number,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  images: [String],
  features: [String],
  ingredients: [String],
  tags: [String],
  metaDescription: String,
  inStock: { type: Boolean, default: true },
  inventory: { type: Number, default: 100 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  nutritionFacts: Object,
}, { collection: 'products', timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const teaBagProducts = [
  {
    name: "Red Rose Petals and Buds Tea Bags",
    slug: "red-rose-petals-buds-tea-bags",
    shortDescription: "Subtly sweet and floral tea with delicate aroma and hints of strawberry",
    description: `Red rose petals and buds offer a subtly sweet and floral flavor with a delicate aroma. They can be described as having a gentle sweetness, sometimes with hints of fruit or a slight tartness. Some also note a subtle floral note with a touch of sweetness, and a slight hint of strawberry.

**Instructions: Steep for 4-7 minutes**

**Detailed Steeping Instructions:**

**Boil Water:** Bring 8 ounces of water to a rolling boil.

**Add Petals/Buds:** Add 1-2 teaspoons (1 tea bag) of red rose petals or buds (dried or fresh) to the boiling water.

**Steep:** Cover the pot and let it steep for 4-7 minutes or to the strength of your liking.

**Strain and Serve:** Remove the strainer and serve your rose tea.

**Optional Additions:** Add sugar, milk, lemon, or other infusions to taste.`,
    price: 14.99,
    images: ["https://images.unsplash.com/photo-1582899101659-7e9124fccbeb?w=800&h=600&fit=crop"],
    features: [
      "12 premium tea bags per box",
      "Subtly sweet and floral flavor",
      "Natural hints of strawberry",
      "Caffeine-free herbal blend",
      "Steep for 4-7 minutes for optimal flavor"
    ],
    ingredients: ["Dried red rose petals", "Rose buds"],
    tags: ["floral", "sweet", "caffeine-free", "herbal", "aromatherapy"],
    metaDescription: "Premium red rose petals and buds tea bags with subtle sweetness and delicate floral aroma. 12 tea bags per box."
  },
  {
    name: "Strawberry Hibiscus Tea Bags",
    slug: "strawberry-hibiscus-tea-bags",
    shortDescription: "Refreshing blend of tart hibiscus and sweet strawberry with antioxidant benefits",
    description: `Strawberry hibiscus tea, a refreshing blend of tart hibiscus and sweet strawberry, offers potential health benefits. Hibiscus, known for its antioxidant content and potential to lower blood pressure, is combined with the vitamin C and antioxidants of strawberries. The antioxidant power of both hibiscus and strawberries protect the body against damage from free radicals, boosts immunity, and aids in skin health.

**Instructions:**

**Choose your method:**
You can use loose leaf hibiscus flowers and fresh strawberries, a tea bag blend, or hibiscus tea bags with strawberry flavoring.

**Brewing hot tea:**
For loose leaf hibiscus and strawberries, boil water and steep the ingredients for about 5-7 minutes. For tea bags, steep for 3-5 minutes or follow instructions on the packaging.

**Brewing iced tea:**
You can steep the tea in hot water and then cool it down or steep it directly in cold water.

**Enjoy:**
Serve hot or iced. You can add honey or other sweeteners to taste.`,
    price: 14.99,
    images: ["https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&h=600&fit=crop"],
    features: [
      "12 premium tea bags per box",
      "Rich in antioxidants and vitamin C",
      "Supports immune system health",
      "May help lower blood pressure",
      "Caffeine-free herbal blend",
      "Steep for 3-7 minutes"
    ],
    ingredients: ["Hibiscus flowers", "Natural strawberry flavoring", "Strawberry pieces"],
    tags: ["antioxidant", "immune-support", "caffeine-free", "fruity", "tart"],
    metaDescription: "Antioxidant-rich strawberry hibiscus tea bags with immune-boosting benefits. Tart and refreshing herbal blend."
  },
  {
    name: "Dandelion Root Tea Bags",
    slug: "dandelion-root-tea-bags",
    shortDescription: "Caffeine-free coffee alternative supporting liver and kidney health",
    description: `Dandelion root is native to Eurasia (around 30 million years ago) and has naturalized across the globe, particularly in temperate regions. It's known as Taraxacum officinale. The plant's history in North America is linked to its introduction by early colonists, who brought it for its medicinal and nutritional properties.

Dandelion root offers various health benefits, including improved digestion, liver & kidney support (detoxifies both liver and kidney) and a potential aid in weight management. It's been known to reduce acne, increase milk flow of women who breastfeed, as well as provides boosts of energy. It's also rich in antioxidants and can be enjoyed as a caffeine-free alternative to coffee, which has aided in better night's rest.

**Instructions:**

**Heat Water:** Bring fresh, filtered water to a rolling boil.

**Pour Water:** Pour 6-8 oz of boiling water over the dandelion root tea bag in a cup.

**Steep:** Allow the tea bag to steep for 5-15 minutes, depending on your desired strength.

**Squeeze (Optional):** You can gently squeeze the tea bag to extract more flavor.

**Enjoy:** Serve hot or let cool and add ice for a refreshing iced tea.

**Additional Tips:**

**Sweeten:** If you prefer a sweeter taste, add honey, sugar, or another sweetener to your liking.

**Lemon:** Dandelion root tea can also be enjoyed with a squeeze of lemon.

**Experiment:** You can experiment with different brewing times and amounts of tea bags to find your perfect cup.`,
    price: 14.99,
    images: ["https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&h=600&fit=crop"],
    features: [
      "12 premium tea bags per box",
      "Natural liver and kidney detox support",
      "Caffeine-free coffee alternative",
      "Rich in antioxidants",
      "Supports digestive health",
      "May aid in weight management",
      "Steep for 5-15 minutes"
    ],
    ingredients: ["Organic dandelion root"],
    tags: ["detox", "liver-support", "caffeine-free", "digestive", "antioxidant"],
    metaDescription: "Organic dandelion root tea bags for natural detox and liver support. Caffeine-free coffee alternative with health benefits."
  },
  {
    name: "Nettle Leaf Tea Bags",
    slug: "nettle-leaf-tea-bags",
    shortDescription: "Highly nutritious herbal tea with ancient medicinal traditions",
    description: `Nettle thrives in woodlands and shady areas throughout Europe and eastern North America. It is also called stinging nettle because the leaves are lined with stinging hairs that inject histamine into the skin when handled or brushed against. The herb is highly nutritious and its medicinal use can be traced back to the ancient world.

**Instructions:**

**Boil water:** Bring water to a boil in a kettle or saucepan.

**Add tea bag:** Place one tea bag into a cup or mug.

**Steep:** Pour the hot water over the tea bag and allow it to steep for 3-4 minutes.

**Adjust steeping time:** For a stronger flavor, increase the steeping time by one minute.

**Remove tea bag:** Once steeping is complete, remove the tea bag.

**Optional additions:** You can add honey or sweetener if desired.

**Serve:** Enjoy your freshly brewed nettle tea.`,
    price: 14.99,
    images: ["https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&h=600&fit=crop"],
    features: [
      "12 premium tea bags per box",
      "Highly nutritious herbal blend",
      "Ancient medicinal herb",
      "Rich in vitamins and minerals",
      "Caffeine-free",
      "Steep for 3-4 minutes"
    ],
    ingredients: ["Dried nettle leaves"],
    tags: ["nutritious", "ancient-remedy", "caffeine-free", "mineral-rich", "herbal"],
    metaDescription: "Premium nettle leaf tea bags rich in nutrients and minerals. Ancient herbal remedy with modern health benefits."
  },
  {
    name: "Dandelion Root & Nettle Leaf Blend Tea Bags",
    slug: "dandelion-nettle-blend-tea-bags",
    shortDescription: "Powerful detox blend supporting liver, kidney, and urinary health",
    description: `Most people consider dandelion an invasive weed, but those long taproots actually improve soil condition by enhancing nitrogen concentration. Dandelion root, dried and chopped, is used in herbal tea blends.

Dandelion root and nettle leaf tea bags are often combined to create a herbal blend with various potential health benefits, particularly focusing on detoxification and cleansing.

• Dandelion leaves can act as a diuretic, aiding the kidneys in flushing out toxins from the body.
• Dandelion root is believed to have detoxifying effects on the liver and colon.
• Nettle may help in increasing urine production, supporting kidney function and aiding in flushing harmful bacteria from the urinary tract.
• The combination is considered a gentle herbal drink that can support overall body cleansing and radiance.
• Detoxification and Cleansing, (both liver and kidneys) support, urinary health, digestive health, anti-inflammatory properties (joint pain and arthritic relief), allergy relief, great source of vitamins A, C, & D) and minerals (zinc, iron, magnesium, potassium), as well as beta-carotene.

**BREAKDOWN:**

**Benefits associated with Dandelion:**

• **Diuretic effect:** Dandelion leaves are known to act as a diuretic, potentially helping to flush out toxins and excess fluid from the body. This can also help with conditions like bloating.
• **Liver and Digestion Support:** Dandelion root and leaves are believed to help aid digestion, improve bile flow, and support liver function and detoxification.
• **Blood Sugar Regulation:** Some studies suggest that dandelion may help regulate blood sugar levels and improve insulin sensitivity, particularly in type 2 diabetes.
• **Antioxidant Rich:** Dandelion is rich in antioxidants, including beta-carotene, which can help protect cells from damage and stress.
• **Anti-inflammatory Properties:** Dandelion contains compounds that may help reduce inflammation.

**Benefits associated with Nettle:**

• **Diuretic and Kidney Support:** Nettle is also thought to increase urine production and help flush harmful bacteria from the urinary tract, potentially supporting kidney function and helping with fluid retention.
• **Anti-inflammatory Properties:** Some studies suggest that nettle has anti-inflammatory properties that may be beneficial for conditions like arthritis.
• **Allergy Relief:** Nettle is often used as a natural remedy for allergies and may help reduce histamine levels.

**Combined Benefits:**

The combination of Dandelion and Nettle is often used to support overall body cleansing and detoxification. Their diuretic properties can help purify the blood and digestive system. This blend may also be beneficial for urinary tract health and reducing inflammation. In addition to these, dandelion is also known for its potential effects on liver health, cholesterol, and hypertension, while nettle may be beneficial for blood sugar issues.

**Important Notes:**

While these benefits are associated with Dandelion and Nettle, it's important to consult with a healthcare professional before using these teas for medicinal purposes, especially if you have any pre-existing health conditions or are taking medications. Dandelion can interact with certain medications, such as diuretics and antibiotics, so it's essential to consult with your doctor before using it if you are on any medication. If you have allergies to ragweed or related plants, dandelion may trigger a reaction.

**Instructions:**

**Boil water:** Bring water to a boil in a kettle or pot.

**Prepare tea bag:** Place one tea bag in a cup.

**Pour hot water:** Pour the hot water over the tea bag in the cup.

**Steep:** Allow the tea bag to steep for 3-8 minutes, or to your preferred taste.

**Remove bag:** Once steeped, remove the tea bag and discard it.

**Enjoy:** Serve hot or, if desired, cool it down and add ice.

**Additional Notes:**

**Dandelion Root:** For a stronger dandelion root tea, some suggest boiling the root for 15-20 minutes.

**Sweeteners:** You can add honey, maple syrup, or other sweeteners to taste.

**Safety:** If you have any health conditions or are taking medications, consult with a healthcare professional before drinking nettle or dandelion tea.`,
    price: 15.99,
    images: ["https://images.unsplash.com/photo-1597318281675-91d9b15e0d50?w=800&h=600&fit=crop"],
    features: [
      "12 premium tea bags per box",
      "Powerful detox and cleansing blend",
      "Supports liver and kidney function",
      "Rich in vitamins A, C, D and minerals",
      "Anti-inflammatory properties",
      "May provide allergy relief",
      "Steep for 3-8 minutes"
    ],
    ingredients: ["Organic dandelion root", "Dried nettle leaves"],
    tags: ["detox", "cleansing", "liver-support", "kidney-support", "anti-inflammatory"],
    metaDescription: "Powerful dandelion root and nettle leaf blend for natural detox and cleansing. Supports liver and kidney health."
  },
  {
    name: "Rooibos Tea Bags",
    slug: "rooibos-tea-bags",
    shortDescription: "Naturally sweet, nutty South African red bush tea with no bitterness",
    description: `Rooibos tea is often described as having a naturally sweet, nutty, and earthy flavor with hints of honey and wood. It lacks bitterness and astringency, making it a smooth and refreshing beverage.

**Instructions:** Steep for 5-7 minutes and add your favorite fruit flavoring (ei. peach, orange, etc). For tea bags, steep for 3-5 minutes`,
    price: 12.99,
    images: ["https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=600&fit=crop"],
    features: [
      "12 premium tea bags per box",
      "Naturally sweet with no added sugar",
      "No bitterness or astringency",
      "Caffeine-free",
      "Rich, nutty flavor with honey notes",
      "Steep for 3-7 minutes"
    ],
    ingredients: ["Organic rooibos (red bush) leaves"],
    tags: ["naturally-sweet", "caffeine-free", "smooth", "nutty", "south-african"],
    metaDescription: "Premium rooibos tea bags with naturally sweet, nutty flavor. Caffeine-free South African red bush tea with no bitterness."
  },
  {
    name: "Lavender Tea Bags",
    slug: "lavender-tea-bags",
    shortDescription: "Calming floral tea with sweet, herbaceous notes and relaxing properties",
    description: `Lavender tea offers a unique, floral, and subtly sweet flavor with herbaceous notes. The taste is often described as refreshing and calming, with hints of rosemary, mint, and sometimes green apple or earthy undertones. Some blends can even have a slight smoky or woody flavor.

**Instructions:** Steep for 5-7 minutes. For tea bags, steep for 3-5 minutes

**Detailed Instructions:**

**1. Heat Water:** Bring water to a boil in a kettle or pot.

**2. Add Lavender:** Place fresh or dried lavender buds (1 tea bag) into a tea infuser or directly into your cup.

**3. Steep:** Pour the boiling water over the lavender and steep for 5-10 minutes, adjusting the time for desired strength.

**4. Strain:** Remove the infuser (if used) or use a fine mesh strainer to remove the lavender buds.

**5. Serve:** Pour the tea into a cup and enjoy, optionally sweetening with honey or lemon.`,
    price: 12.99,
    images: ["https://images.unsplash.com/photo-1611149101130-bf4d80deb373?w=800&h=600&fit=crop"],
    features: [
      "12 premium tea bags per box",
      "Calming and relaxing properties",
      "Unique floral and sweet flavor",
      "Caffeine-free",
      "Aromatherapy benefits",
      "Steep for 3-10 minutes"
    ],
    ingredients: ["Dried lavender buds"],
    tags: ["calming", "floral", "relaxing", "aromatherapy", "caffeine-free"],
    metaDescription: "Premium lavender tea bags for relaxation and calm. Floral, sweet herbal tea with aromatherapy benefits."
  },
  {
    name: "Chamomile Tea Bags",
    slug: "chamomile-tea-bags",
    shortDescription: "Gentle, soothing tea with subtle floral sweetness and apple-like notes",
    description: `Chamomile tea is known for its subtle, floral flavor with a hint of sweetness, often described as having apple-like notes. Some also perceive a mild, earthy undertone or a slight herbal bitterness. It's a calming and soothing drink, and the flavor is generally considered mellow and gentle.

**Instructions:** Steep for 5-7 minutes. For tea bags, steep for 3-5 minutes

If you prefer a stronger infusion, you can steep it for 8-10 minutes. Chamomile tea won't become bitter even if steeped for longer than 5 minutes, unlike black tea.

**Detailed Instructions:**

**Heat the water:** Bring water to a boil, then let it cool slightly to around 200°F (93°C). This avoids scalding the delicate chamomile flowers.

**Add Chamomile:**
• **Loose Leaf:** Place 1-2 tablespoons of loose-leaf chamomile flowers (1 tea bag) into a teapot or infuser basket.
• **Tea Bag:** Place one chamomile tea bag in a mug.

**Steep the tea:** Pour the hot water over the chamomile.

**Steep Time:** Cover the mug or teapot and let it steep for 5-10 minutes.
• For a lighter flavor, steep for 5 minutes.
• For a stronger flavor, steep for 10 minutes.`,
    price: 13.99,
    images: ["https://images.unsplash.com/photo-1597149960734-4d6cea0af41d?w=800&h=600&fit=crop"],
    features: [
      "12 premium tea bags per box",
      "Gentle, soothing properties",
      "Subtle apple-like sweetness",
      "Won't become bitter with longer steeping",
      "Caffeine-free",
      "Perfect bedtime tea",
      "Steep for 5-10 minutes"
    ],
    ingredients: ["Dried chamomile flowers"],
    tags: ["soothing", "bedtime", "gentle", "floral", "caffeine-free"],
    metaDescription: "Premium chamomile tea bags with gentle, soothing properties. Perfect bedtime tea with subtle floral sweetness."
  },
  {
    name: "Lemon Balm Tea Bags",
    slug: "lemon-balm-tea-bags",
    shortDescription: "Refreshing lemony tea with subtle mint undertones and calming effects",
    description: `Lemon balm has a mild, lemony flavor with subtle minty undertones. It's often described as refreshing and soothing, making it a popular choice for teas and infusions. The flavor is gentle and not overly acidic, making it enjoyable on its own or when combined with other herbs.

**Instructions:** Steep for 5-10 minutes. For tea bags, steep for 3-5 minutes

**Here are the steps for brewing lemon balm tea:**

• Add 1-2 teaspoons (1 tea bag) of dried lemon balm leaves or 2-3 fresh lemon balm leaves to a teapot or mug.
• Pour boiling water over the leaves.
• Cover and let steep for 5-10 minutes.
• Strain the tea and enjoy.

Steeping for longer than 10 minutes can make the tea bitter.`,
    price: 12.99,
    images: ["https://images.unsplash.com/photo-1628069230085-fcaede0f1f0a?w=800&h=600&fit=crop"],
    features: [
      "12 premium tea bags per box",
      "Mild lemony flavor with mint notes",
      "Refreshing and soothing",
      "Caffeine-free",
      "Calming properties",
      "Steep for 3-10 minutes"
    ],
    ingredients: ["Dried lemon balm leaves"],
    tags: ["lemony", "refreshing", "calming", "minty", "caffeine-free"],
    metaDescription: "Premium lemon balm tea bags with mild lemony flavor and mint undertones. Refreshing and soothing herbal tea."
  },
  {
    name: "Holy Basil (Tulsi) Tea Bags",
    slug: "holy-basil-tulsi-tea-bags",
    shortDescription: "Complex spicy tea with peppery notes and sweet hints of anise and lemon",
    description: `Holy basil tea, also known as tulsi tea, has a unique and complex flavor profile. It is typically described as having:

• **Spicy and peppery notes:** Reminiscent of cloves and cinnamon.
• **Earthy and aromatic:** Similar to fresh basil and oregano.
• **Slightly sweet:** With hints of anise and lemon.
• **Astringent:** With a lingering aftertaste.

The exact taste can vary depending on the variety of holy basil used, the brewing method, and the individual's taste preferences. Some people may find it reminiscent of chewing gum, while others may detect a more medicinal flavor.

It's important to note that holy basil tea is generally safe to consume, but it may cause mild side effects such as nausea or diarrhea in some individuals. If you experience any adverse reactions, discontinue use.

**Instructions:** Steep for 5-7 minutes. For tea bags, steep for 3-5 minutes

**Here's a more detailed guide:**

• **Boil water:** Use fresh, filtered water and bring it to a boil, then let it cool slightly (around 2 minutes) before adding the Holy Basil.
• **Add Holy Basil:** Use 1-2 teaspoons (1 tea bag) of loose leaf Holy Basil per 8 ounces (240ml) of water.
• **Steep:** Let the Holy Basil steep for 5-7 minutes, or longer for a stronger tea.
• **Strain:** Remove the leaves or infuser.
• **Enjoy:** Sweeten with honey or lemon if desired.`,
    price: 14.99,
    images: ["https://images.unsplash.com/photo-1602165778081-f96dd45e1d1b?w=800&h=600&fit=crop"],
    features: [
      "12 premium tea bags per box",
      "Complex spicy and peppery flavor",
      "Sacred herb in Ayurvedic tradition",
      "Adaptogenic properties",
      "Caffeine-free",
      "Steep for 3-7 minutes"
    ],
    ingredients: ["Dried holy basil (tulsi) leaves"],
    tags: ["spicy", "adaptogenic", "ayurvedic", "complex", "caffeine-free"],
    metaDescription: "Premium holy basil (tulsi) tea bags with complex spicy flavor. Sacred Ayurvedic herb with adaptogenic properties."
  },
  {
    name: "Hibiscus Zest Tea Bags",
    slug: "hibiscus-zest-tea-bags",
    shortDescription: "Vibrant red tea blending tart hibiscus with citrus zest and aromatic herbs",
    description: `Hibiscus Zest brings the best of the citrus spectrum with floral and medicinal herbs in tow! This potpourri of colors and flavors brews a vibrant red cup and creates an atmosphere of restful pleasure. With the aroma of lavender to purify the mind and hibiscus blossoms to cleanse the body, the infusion overflows with the subtle magic of cloves and licorice root.

**ALLERGEN:** Hibiscus may be intercropped with peanuts. Occasionally, fragments of peanut shells may be present.

**Instructions:** Steep for 5-15 minutes. For tea bags, steep for 5-7 minutes or to the flavor strength of your liking.

**1. Prepare Hibiscus Tea:**

• **Choose your hibiscus:** You can use dried hibiscus flowers or tea bags. Red hibiscus flowers are typically preferred for tea. If using fresh hibiscus flowers, trim them by removing the green calyx and seed pods.
• **Boil Water:** Bring water to a boil.
• **Steep:** Pour hot water over the hibiscus flowers and let them steep. Steeping time varies depending on whether you're making hot or iced tea. For hot tea, steep for about 5-15 minutes. For iced tea, you can cold brew by leaving the hibiscus in the refrigerator overnight.
• **Strain:** Strain the tea to remove the hibiscus flowers.

**2. Add Citrus Zest:**

• **Choose your citrus:** Lemon or lime zest are popular choices.
• **Zest the citrus:** Use a microplane or citrus zester to remove the colored outer layer of the fruit. Avoid the white pith, which can be bitter.
• **Add the zest:** Add the citrus zest to your brewed hibiscus tea.

**3. Sweeten (Optional):**

Sweeten your tea to taste with your preferred sweetener, such as sugar, honey, maple syrup, or agave.

**4. Enjoy:**

Serve hot or cold over ice. You can also add other flavorings like mint, ginger, or cinnamon to enhance the taste.

**Tip:** Zest adds a refreshing, bright citrus flavor to the tart hibiscus tea. Steeping for too long can make the tea bitter, so be mindful of the steeping time.`,
    price: 14.99,
    images: ["https://images.unsplash.com/photo-1541963058-d2cc1df227c8?w=800&h=600&fit=crop"],
    features: [
      "12 premium tea bags per box",
      "Vibrant red color when brewed",
      "Complex blend with citrus zest",
      "Contains lavender for aromatherapy",
      "Rich in antioxidants",
      "Caffeine-free",
      "Steep for 5-15 minutes"
    ],
    ingredients: ["Hibiscus flowers", "Citrus zest", "Lavender", "Cloves", "Licorice root"],
    tags: ["vibrant", "citrusy", "antioxidant", "complex-blend", "caffeine-free"],
    metaDescription: "Vibrant hibiscus zest tea bags with citrus and aromatic herbs. Complex antioxidant-rich blend that brews a beautiful red cup."
  }
];

async function seedTeaProducts() {
  console.log('Starting tea products seeding...');
  
  try {
    // Clean up the URI to remove any malformed options
    let cleanUri = MONGODB_URI;
    cleanUri = cleanUri.replace(/[&?]retryWrites=(?=&|$)/g, '');
    cleanUri = cleanUri.replace(/[&?]retryWrites$/g, '');
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(cleanUri);
    console.log('✅ Connected to MongoDB');
    
    // First, find or create the "Tea Bags" category
    let teaBagsCategory = await Category.findOne({ 
      $or: [
        { name: 'Tea Bags' },
        { slug: 'tea-bags' }
      ]
    });
    
    if (!teaBagsCategory) {
      console.log('Creating Tea Bags category...');
      try {
        teaBagsCategory = await Category.create({
          name: 'Tea Bags',
          slug: 'tea-bags',
          description: 'Premium herbal tea bags and blends for health and wellness',
          image: 'https://images.unsplash.com/photo-1597149960734-4d6cea0af41d?w=400&h=300&fit=crop'
        });
      } catch (error) {
        if (error.code === 11000) {
          // Category already exists, try to find it again
          console.log('Category already exists, finding existing one...');
          teaBagsCategory = await Category.findOne({ slug: 'tea-bags' });
        } else {
          throw error;
        }
      }
    } else {
      console.log('Found existing Tea Bags category');
    }

    console.log('Tea Bags category ID:', teaBagsCategory._id);

    // Insert all tea products
    let successCount = 0;
    let errorCount = 0;
    
    for (const productData of teaBagProducts) {
      try {
        console.log(`Inserting product: ${productData.name}`);
        
        // Check if product already exists
        const existingProduct = await Product.findOne({ slug: productData.slug });
        if (existingProduct) {
          console.log(`⚠️  Product already exists: ${productData.name}`);
          continue;
        }
        
        await Product.create({
          ...productData,
          category: teaBagsCategory._id
        });
        
        console.log(`✅ Added: ${productData.name}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error inserting ${productData.name}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Seeding Summary:`);
    console.log(`   ✅ Successfully added: ${successCount} products`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📝 Total attempted: ${teaBagProducts.length}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedTeaProducts();