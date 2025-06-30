// "use client";

// import { motion, useInView } from "framer-motion";
// import { useRef } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ArrowRight } from "lucide-react";

// const categories = [
//   {
//     id: "1",
//     name: "Fresh",
//     subtitle: "Exotic Fruit",
//     discount: "30% OFF",
//     image:
//       "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=600&h=400&fit=crop",
//     bgColor: "from-orange-300 to-orange-400",
//     textColor: "text-gray-800",
//     link: "/shop?category=fruits",
//   },
//   {
//     id: "2",
//     name: "Be Fitness",
//     subtitle: "Healthy Food",
//     discount: "50% OFF",
//     image:
//       "https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&h=400&fit=crop",
//     bgColor: "from-lime-400 to-green-400",
//     textColor: "text-gray-800",
//     link: "/shop?category=healthy",
//   },
//   {
//     id: "3",
//     name: "Organic",
//     subtitle: "Wellness Drinks",
//     discount: "25% OFF",
//     image:
//       "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=600&h=400&fit=crop",
//     bgColor: "from-purple-400 to-pink-400",
//     textColor: "text-white",
//     link: "/shop?category=organic",
//   },
// ];

// function CategoryCard({ category, index }: { category: any; index: number }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 30 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       viewport={{ once: true }}
//       transition={{ duration: 0.6, delay: index * 0.1 }}
//       whileHover={{ scale: 1.05, y: -5 }}
//       className="group"
//     >
//       <Link href={category.link}>
//         <div
//           className={`relative overflow-hidden rounded-3xl h-[400px] bg-gradient-to-br ${category.bgColor} shadow-xl hover:shadow-2xl transition-all duration-300`}
//         >
//           {/* Discount Badge */}
//           <Badge className="absolute top-6 left-6 bg-red-500 text-white font-bold text-sm px-4 py-2 rounded-full z-20">
//             {category.discount}
//           </Badge>

//           {/* Content */}
//           <div className="relative z-10 p-8 h-full flex flex-col justify-between">
//             <div>
//               <h3 className={`text-4xl font-bold mb-2 ${category.textColor}`}>
//                 {category.name}
//               </h3>
//               <h4 className={`text-3xl font-bold mb-6 ${category.textColor}`}>
//                 {category.subtitle}
//               </h4>
//             </div>

//             <div>
//               <Button
//                 className={`${
//                   category.textColor === "text-white"
//                     ? "bg-white text-gray-800"
//                     : "bg-gray-800 text-white"
//                 } hover:scale-105 transition-transform font-semibold`}
//                 size="lg"
//               >
//                 View Products
//                 <ArrowRight className="ml-2 w-5 h-5" />
//               </Button>
//             </div>
//           </div>

//           {/* Product Image */}
//           <div className="absolute bottom-0 right-0 w-2/3 h-2/3">
//             <Image
//               src={category.image}
//               alt={category.name}
//               fill
//               className="object-cover object-bottom opacity-90 group-hover:scale-110 transition-transform duration-700"
//             />
//           </div>

//           {/* Decorative Elements */}
//           <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full"></div>
//           <div className="absolute top-16 right-8 w-4 h-4 bg-white/30 rounded-full"></div>
//           <div className="absolute bottom-32 left-8 w-6 h-6 bg-white/25 rounded-full"></div>
//         </div>
//       </Link>
//     </motion.div>
//   );
// }

// export function ColorfulCategories() {
//   const ref = useRef<HTMLDivElement>(null);
//   const isInView = useInView(ref, { once: true, amount: 0.2 });

//   return (
//     <section ref={ref} className="py-24 bg-white">
//       <div className="container mx-auto px-4">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
import { ArrowRight } from "lucide-react";

const categories = [
  {
    id: "1",
    name: "Fresh & Pure",
    subtitle: "Juice Blends",
    image:
      "https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&h=400&fit=crop",
    bgColor: "from-emerald-300 to-teal-400",
    textColor: "text-gray-800",
    link: "/shop?category=juice-blends",
  },
  {
    id: "2",
    name: "Cool & Calm",
    subtitle: "Herbal Iced Teas",
    image:
      "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600&h=400&fit=crop",
    bgColor: "from-lime-400 to-green-400",
    textColor: "text-gray-800",
    link: "/shop?category=herbal-iced-teas",
  },
  {
    id: "3",
    name: "Power & Energy",
    subtitle: "Nutrient Smoothies",
    image:
      "https://images.unsplash.com/photo-1553530979-98cc0de94293?w=600&h=400&fit=crop",
    bgColor: "from-purple-400 to-pink-400",
    textColor: "text-white",
    link: "/shop?category=nutrient-smoothies",
  },
];

function CategoryCard({ category, index }: { category: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="group"
    >
      <Link href={category.link}>
        <div
          className={`relative overflow-hidden rounded-3xl h-[400px] bg-gradient-to-br ${category.bgColor} shadow-xl hover:shadow-2xl transition-all duration-300`}
        >
          {/* Content */}
          <div className="relative z-10 p-8 h-full flex flex-col justify-between">
            <div>
              <h3 className={`text-4xl font-bold mb-2 ${category.textColor}`}>
                {category.name}
              </h3>
              <h4 className={`text-3xl font-bold mb-6 ${category.textColor}`}>
                {category.subtitle}
              </h4>
            </div>

            <div>
              <Button
                className={`${
                  category.textColor === "text-white"
                    ? "bg-white text-gray-800"
                    : "bg-gray-800 text-white"
                } hover:scale-105 transition-transform font-semibold`}
                size="lg"
              >
                View Products
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Product Image */}
          <div className="absolute bottom-0 right-0 w-2/3 h-2/3">
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover object-bottom opacity-90 group-hover:scale-110 transition-transform duration-700"
            />
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full"></div>
          <div className="absolute top-16 right-8 w-4 h-4 bg-white/30 rounded-full"></div>
          <div className="absolute bottom-32 left-8 w-6 h-6 bg-white/25 rounded-full"></div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ColorfulCategories() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
