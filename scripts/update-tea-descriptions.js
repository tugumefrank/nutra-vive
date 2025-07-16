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

// Product schema
const productSchema = new mongoose.Schema({
  name: String,
  slug: String,
  description: String,
}, { collection: 'products' });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Updated descriptions with detailed instructions
const updatedDescriptions = {
  'red-rose-petals-buds-tea-bags': `Red rose petals and buds offer a subtly sweet and floral flavor with a delicate aroma. They can be described as having a gentle sweetness, sometimes with hints of fruit or a slight tartness. Some also note a subtle floral note with a touch of sweetness, and a slight hint of strawberry.

**Instructions: Steep for 4-7 minutes**

**Detailed Steeping Instructions:**

**Boil Water:** Bring 8 ounces of water to a rolling boil.

**Add Petals/Buds:** Add 1-2 teaspoons (1 tea bag) of red rose petals or buds (dried or fresh) to the boiling water.

**Steep:** Cover the pot and let it steep for 4-7 minutes or to the strength of your liking.

**Strain and Serve:** Remove the strainer and serve your rose tea.

**Optional Additions:** Add sugar, milk, lemon, or other infusions to taste.`,

  'strawberry-hibiscus-tea-bags': `Strawberry hibiscus tea, a refreshing blend of tart hibiscus and sweet strawberry, offers potential health benefits. Hibiscus, known for its antioxidant content and potential to lower blood pressure, is combined with the vitamin C and antioxidants of strawberries. The antioxidant power of both hibiscus and strawberries protect the body against damage from free radicals, boosts immunity, and aids in skin health.

**Instructions:**

**Choose your method:**
You can use loose leaf hibiscus flowers and fresh strawberries, a tea bag blend, or hibiscus tea bags with strawberry flavoring.

**Brewing hot tea:**
For loose leaf hibiscus and strawberries, boil water and steep the ingredients for about 5-7 minutes. For tea bags, steep for 3-5 minutes or follow instructions on the packaging.

**Brewing iced tea:**
You can steep the tea in hot water and then cool it down or steep it directly in cold water.

**Enjoy:**
Serve hot or iced. You can add honey or other sweeteners to taste.`,

  'dandelion-root-tea-bags': `Dandelion root is native to Eurasia (around 30 million years ago) and has naturalized across the globe, particularly in temperate regions. It's known as Taraxacum officinale. The plant's history in North America is linked to its introduction by early colonists, who brought it for its medicinal and nutritional properties.

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

  'nettle-leaf-tea-bags': `Nettle thrives in woodlands and shady areas throughout Europe and eastern North America. It is also called stinging nettle because the leaves are lined with stinging hairs that inject histamine into the skin when handled or brushed against. The herb is highly nutritious and its medicinal use can be traced back to the ancient world.

**Instructions:**

**Boil water:** Bring water to a boil in a kettle or saucepan.

**Add tea bag:** Place one tea bag into a cup or mug.

**Steep:** Pour the hot water over the tea bag and allow it to steep for 3-4 minutes.

**Adjust steeping time:** For a stronger flavor, increase the steeping time by one minute.

**Remove tea bag:** Once steeping is complete, remove the tea bag.

**Optional additions:** You can add honey or sweetener if desired.

**Serve:** Enjoy your freshly brewed nettle tea.`,

  'dandelion-nettle-blend-tea-bags': `Most people consider dandelion an invasive weed, but those long taproots actually improve soil condition by enhancing nitrogen concentration. Dandelion root, dried and chopped, is used in herbal tea blends.

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

  'rooibos-tea-bags': `Rooibos tea is often described as having a naturally sweet, nutty, and earthy flavor with hints of honey and wood. It lacks bitterness and astringency, making it a smooth and refreshing beverage.

**Instructions:** Steep for 5-7 minutes and add your favorite fruit flavoring (ei. peach, orange, etc). For tea bags, steep for 3-5 minutes`,

  'lavender-tea-bags': `Lavender tea offers a unique, floral, and subtly sweet flavor with herbaceous notes. The taste is often described as refreshing and calming, with hints of rosemary, mint, and sometimes green apple or earthy undertones. Some blends can even have a slight smoky or woody flavor.

**Instructions:** Steep for 5-7 minutes. For tea bags, steep for 3-5 minutes

**Detailed Instructions:**

**1. Heat Water:** Bring water to a boil in a kettle or pot.

**2. Add Lavender:** Place fresh or dried lavender buds (1 tea bag) into a tea infuser or directly into your cup.

**3. Steep:** Pour the boiling water over the lavender and steep for 5-10 minutes, adjusting the time for desired strength.

**4. Strain:** Remove the infuser (if used) or use a fine mesh strainer to remove the lavender buds.

**5. Serve:** Pour the tea into a cup and enjoy, optionally sweetening with honey or lemon.`,

  'chamomile-tea-bags': `Chamomile tea is known for its subtle, floral flavor with a hint of sweetness, often described as having apple-like notes. Some also perceive a mild, earthy undertone or a slight herbal bitterness. It's a calming and soothing drink, and the flavor is generally considered mellow and gentle.

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

  'lemon-balm-tea-bags': `Lemon balm has a mild, lemony flavor with subtle minty undertones. It's often described as refreshing and soothing, making it a popular choice for teas and infusions. The flavor is gentle and not overly acidic, making it enjoyable on its own or when combined with other herbs.

**Instructions:** Steep for 5-10 minutes. For tea bags, steep for 3-5 minutes

**Here are the steps for brewing lemon balm tea:**

• Add 1-2 teaspoons (1 tea bag) of dried lemon balm leaves or 2-3 fresh lemon balm leaves to a teapot or mug.
• Pour boiling water over the leaves.
• Cover and let steep for 5-10 minutes.
• Strain the tea and enjoy.

Steeping for longer than 10 minutes can make the tea bitter.`,

  'holy-basil-tulsi-tea-bags': `Holy basil tea, also known as tulsi tea, has a unique and complex flavor profile. It is typically described as having:

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

  'hibiscus-zest-tea-bags': `Hibiscus Zest brings the best of the citrus spectrum with floral and medicinal herbs in tow! This potpourri of colors and flavors brews a vibrant red cup and creates an atmosphere of restful pleasure. With the aroma of lavender to purify the mind and hibiscus blossoms to cleanse the body, the infusion overflows with the subtle magic of cloves and licorice root.

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

**Tip:** Zest adds a refreshing, bright citrus flavor to the tart hibiscus tea. Steeping for too long can make the tea bitter, so be mindful of the steeping time.`
};

async function updateTeaDescriptions() {
  try {
    // Clean up the URI to remove any malformed options
    let cleanUri = MONGODB_URI;
    cleanUri = cleanUri.replace(/[&?]retryWrites=(?=&|$)/g, '');
    cleanUri = cleanUri.replace(/[&?]retryWrites$/g, '');
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(cleanUri);
    console.log('✅ Connected to MongoDB');
    
    console.log('\n🔄 Starting tea description updates...\n');
    
    let updatedCount = 0;
    let notFoundCount = 0;
    
    for (const [productSlug, newDescription] of Object.entries(updatedDescriptions)) {
      try {
        // Find product by slug
        const product = await Product.findOne({ slug: productSlug });
        
        if (product) {
          await Product.updateOne(
            { _id: product._id },
            { description: newDescription }
          );
          
          console.log(`✅ Updated: ${product.name}`);
          updatedCount++;
        } else {
          console.log(`❌ Product not found: ${productSlug}`);
          notFoundCount++;
        }
      } catch (error) {
        console.error(`❌ Error updating ${productSlug}:`, error.message);
      }
    }
    
    console.log(`\n📊 Update Summary:`);
    console.log(`   ✅ Successfully updated: ${updatedCount} products`);
    console.log(`   ❌ Products not found: ${notFoundCount}`);
    console.log(`   📝 Total attempted: ${Object.keys(updatedDescriptions).length}`);
    
  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

updateTeaDescriptions();