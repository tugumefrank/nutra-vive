// "use client";

// import { motion, useInView } from "framer-motion";
// import { useRef } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { ArrowRight, Droplets, Leaf, Zap, Shield } from "lucide-react";

// const categories = [
//   {
//     id: "1",
//     name: "Cold Pressed Juices",
//     slug: "cold-pressed-juices",
//     description:
//       "Raw, nutrient-packed juices extracted without heat to preserve maximum vitamins and enzymes",
//     image:
//       "https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&h=400&fit=crop",
//     icon: Droplets,
//     color: "from-blue-500 to-cyan-500",
//     features: ["100% Raw", "No Pasteurization", "Maximum Nutrients"],
//     productCount: 12,
//   },
//   {
//     id: "2",
//     name: "Herbal Teas",
//     slug: "herbal-teas",
//     description:
//       "Soothing herbal blends crafted for wellness, relaxation, and natural healing",
//     image:
//       "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600&h=400&fit=crop",
//     icon: Leaf,
//     color: "from-green-500 to-emerald-500",
//     features: ["Caffeine Free", "Organic Herbs", "Traditional Blends"],
//     productCount: 18,
//   },
//   {
//     id: "3",
//     name: "Energy Boosters",
//     slug: "energy-boosters",
//     description:
//       "Natural energy drinks that fuel your day without the crash or artificial stimulants",
//     image:
//       "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=600&h=400&fit=crop",
//     icon: Zap,
//     color: "from-yellow-500 to-orange-500",
//     features: ["Natural Caffeine", "Sustained Energy", "Focus Enhancement"],
//     productCount: 8,
//   },
//   {
//     id: "4",
//     name: "Immune Support",
//     slug: "immune-support",
//     description:
//       "Powerful blends designed to strengthen your immune system and support overall health",
//     image:
//       "https://images.unsplash.com/photo-1553530979-98cc0de94293?w=600&h=400&fit=crop",
//     icon: Shield,
//     color: "from-purple-500 to-pink-500",
//     features: ["Vitamin C Rich", "Antioxidants", "Immunity Boost"],
//     productCount: 15,
//   },
// ];

// function CategoryCard({ category, index }: { category: any; index: number }) {
//   const Icon = category.icon;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 30 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true }}
//       transition={{ duration: 0.6, delay: index * 0.1 }}
//       whileHover={{ y: -5 }}
//       className="group"
//     >
//       <Link href={`/shop?category=${category.slug}`}>
//         <div className="relative overflow-hidden rounded-3xl h-[400px] glass border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-glow">
//           {/* Background Image */}
//           <div className="absolute inset-0">
//             <Image
//               src={category.image}
//               alt={category.name}
//               fill
//               className="object-cover transition-transform duration-700 group-hover:scale-110"
//             />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
//           </div>

//           {/* Content */}
//           <div className="relative z-10 p-8 h-full flex flex-col justify-end">
//             {/* Icon */}
//             <motion.div
//               whileHover={{ scale: 1.1, rotate: 5 }}
//               className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-6 shadow-lg`}
//             >
//               <Icon className="w-8 h-8 text-white" />
//             </motion.div>

//             {/* Category Info */}
//             <div className="mb-4">
//               <div className="flex items-center justify-between mb-2">
//                 <h3 className="text-2xl font-bold text-white">
//                   {category.name}
//                 </h3>
//                 <span className="text-sm text-white/80">
//                   {category.productCount} products
//                 </span>
//               </div>

//               <p className="text-white/90 text-sm mb-4 line-clamp-2">
//                 {category.description}
//               </p>

//               {/* Features */}
//               <div className="flex flex-wrap gap-2 mb-6">
//                 {category.features.map((feature: string) => (
//                   <span
//                     key={feature}
//                     className="text-xs px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white border border-white/20"
//                   >
//                     {feature}
//                   </span>
//                 ))}
//               </div>
//             </div>

//             {/* CTA */}
//             <Button
//               className="w-full bg-white/90 hover:bg-white text-black backdrop-blur-sm border-none"
//               size="sm"
//             >
//               Explore Collection
//               <ArrowRight className="ml-2 w-4 h-4" />
//             </Button>
//           </div>

//           {/* Hover Overlay */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             whileHover={{ opacity: 1 }}
//             className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-5"
//           />
//         </div>
//       </Link>
//     </motion.div>
//   );
// }

// export function CategoryShowcase() {
//   const ref = useRef<HTMLDivElement>(null);
//   const isInView = useInView(ref, { once: true, amount: 0.2 });

//   return (
//     <section
//       ref={ref}
//       className="py-24 bg-gradient-to-b from-background to-muted/30"
//     >
//       <div className="container mx-auto px-4">
//         {/* Section Header */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={isInView ? { opacity: 1, y: 0 } : {}}
//           transition={{ duration: 0.6 }}
//           className="text-center mb-16"
//         >
//           <h2 className="text-4xl lg:text-6xl font-heading font-bold mb-6">
//             Explore Our{" "}
//             <span className="bg-gradient-to-r from-brand-500 to-wellness-500 bg-clip-text text-transparent">
//               Categories
//             </span>
//           </h2>

//           <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
//             From energizing cold-pressed juices to calming herbal teas, discover
//             the perfect beverage for every moment of your wellness journey.
//           </p>
//         </motion.div>

//         {/* Categories Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//           {categories.map((category, index) => (
//             <CategoryCard key={category.id} category={category} index={index} />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Droplets, Leaf, Blend } from "lucide-react";

const categories = [
  {
    id: "1",
    name: "Pure Vitality",
    subtitle: "All-Natural Juice Blends",
    description:
      "Cold-pressed perfection in every bottle. Raw, unfiltered nutrition that energizes your body and awakens your senses.",
    image:
      "https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&h=400&fit=crop",
    icon: Droplets,
    bgColor: "from-emerald-400 via-teal-500 to-cyan-600",
    textColor: "text-white",
    features: [
      "Cold-Pressed",
      "100% Raw",
      "No Added Sugar",
      "Maximum Nutrients",
    ],
    productCount: 12,
    slug: "juice-blends",
  },
  {
    id: "2",
    name: "Zen Refresh",
    subtitle: "Herbal Iced Teas",
    description:
      "Cooling herbal infusions that refresh your spirit and restore your balance with every refreshing sip.",
    image:
      "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600&h=400&fit=crop",
    icon: Leaf,
    bgColor: "from-lime-400 via-green-500 to-emerald-600",
    textColor: "text-white",
    features: [
      "Caffeine-Free",
      "Organic Herbs",
      "Naturally Sweet",
      "Cooling Blend",
    ],
    productCount: 8,
    slug: "herbal-iced-teas",
  },
  {
    id: "3",
    name: "Power Fuel",
    subtitle: "Nutrient-Rich Smoothies",
    description:
      "Superfood-packed smoothies that deliver complete nutrition and sustained energy for your active lifestyle.",
    image:
      "https://images.unsplash.com/photo-1553530979-98cc0de94293?w=600&h=400&fit=crop",
    icon: Blend,
    bgColor: "from-purple-400 via-pink-500 to-orange-500",
    textColor: "text-white",
    features: [
      "Superfood Blend",
      "Protein-Rich",
      "Antioxidant Power",
      "Energy Boost",
    ],
    productCount: 6,
    slug: "nutrient-smoothies",
  },
];

function CategoryCard({ category, index }: { category: any; index: number }) {
  const Icon = category.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      whileHover={{ scale: 1.02, y: -8 }}
      className="group"
    >
      <Link href={`/shop?category=${category.slug}`}>
        <div
          className={`relative overflow-hidden rounded-3xl h-[500px] bg-gradient-to-br ${category.bgColor} shadow-2xl hover:shadow-3xl transition-all duration-500`}
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover opacity-30 transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          </div>

          {/* Floating Decorative Elements */}
          <div className="absolute top-6 right-6 w-16 h-16 bg-white/10 rounded-full backdrop-blur-sm"></div>
          <div className="absolute top-16 right-12 w-8 h-8 bg-white/20 rounded-full"></div>
          <div className="absolute bottom-32 left-6 w-12 h-12 bg-white/15 rounded-full backdrop-blur-sm"></div>

          {/* Content */}
          <div className="relative z-10 p-8 h-full flex flex-col justify-between">
            {/* Top Section - Icon */}
            <div className="flex justify-between items-start">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl border border-white/30"
              >
                <Icon className="w-10 h-10 text-white" />
              </motion.div>

              <div className="text-right">
                <span className="text-white/80 text-sm font-medium">
                  {category.productCount} Products
                </span>
              </div>
            </div>

            {/* Bottom Section - Content */}
            <div>
              <div className="mb-6">
                <h3
                  className={`text-3xl lg:text-4xl font-bold mb-2 ${category.textColor}`}
                >
                  {category.name}
                </h3>
                <h4
                  className={`text-xl lg:text-2xl font-semibold mb-4 text-white/90`}
                >
                  {category.subtitle}
                </h4>
                <p className="text-white/80 text-sm leading-relaxed mb-6">
                  {category.description}
                </p>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-6">
                {category.features.map((feature: string) => (
                  <span
                    key={feature}
                    className="text-xs px-3 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white border border-white/30 font-medium"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                className="w-full bg-white hover:bg-white/90 text-gray-800 font-bold text-lg py-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
                size="lg"
              >
                Explore Collection
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Hover Glow Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent rounded-3xl"
            transition={{ duration: 0.3 }}
          />
        </div>
      </Link>
    </motion.div>
  );
}

export function CategoryShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      className="py-24 bg-gradient-to-b from-orange-50 to-yellow-50"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-400 to-pink-400 text-white px-6 py-3 rounded-full mb-8 shadow-xl">
            <Droplets className="w-5 h-5" />
            <span className="font-bold">Premium Collections</span>
          </div>

          <h2 className="text-4xl lg:text-6xl font-heading font-bold mb-6 text-gray-800">
            Discover Your{" "}
            <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
              Perfect Blend
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From energizing juice blends to soothing herbal teas and
            power-packed smoothies, find the perfect companion for every moment
            of your wellness journey.
          </p>
        </motion.div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            asChild
          >
            <Link href="/shop">
              Shop All Collections
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
