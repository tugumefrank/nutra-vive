// "use client";

// import React from "react";
// import {
//   Leaf,
//   Shield,
//   CheckCircle,
//   Sparkles,
//   Users,
//   Award,
//   Headphones,
// } from "lucide-react";

// const Layout = ({ children }: { children: React.ReactNode }) => {
//   return (
//     <div className="min-h-screen flex">
//       {/* Left Side - Marketing Content */}
//       <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex-col justify-center px-12 relative">
//         {/* WhatsApp Support Badge */}
//         <div className="absolute top-8 right-8">
//           <a
//             href="https://wa.me/9735737764"
//             target="_blank"
//             rel="noopener noreferrer"
//             className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-200 hover:bg-white/90 transition-colors"
//           >
//             <Headphones className="w-4 h-4 text-orange-600" />
//             <span className="text-sm font-medium text-orange-800">Support</span>
//           </a>
//         </div>

//         <div className="max-w-lg">
//           {/* Feature Card */}
//           <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-orange-200/50">
//             <div className="flex items-start gap-4 mb-6">
//               <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
//                 <Sparkles className="w-6 h-6 text-white" />
//               </div>
//               <div className="flex-1">
//                 <h3 className="text-xl font-bold text-gray-900 mb-2">
//                   Reach wellness goals faster
//                 </h3>
//                 <p className="text-gray-600 mb-4">
//                   Get personalized nutrition plans with our certified experts.
//                   Transform your health naturally.
//                 </p>
//                 <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
//                   Learn more
//                 </button>
//               </div>
//             </div>

//             {/* Mini Stats */}
//             <div className="flex items-center justify-between pt-4 border-t border-gray-100">
//               <div className="text-center">
//                 <div className="text-lg font-bold text-gray-900">10K+</div>
//                 <div className="text-xs text-gray-500">Happy Customers</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-lg font-bold text-gray-900">95%</div>
//                 <div className="text-xs text-gray-500">Success Rate</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-lg font-bold text-gray-900">24/7</div>
//                 <div className="text-xs text-gray-500">Support</div>
//               </div>
//             </div>
//           </div>

//           {/* Main Heading */}
//           <div className="mb-8">
//             <h2 className="text-3xl font-bold text-gray-900 mb-4">
//               Introducing new features
//             </h2>
//             <p className="text-gray-700 leading-relaxed">
//               Our latest nutrition tracking and meal planning tools help you
//               make better decisions. Experience personalized wellness like never
//               before with AI-powered recommendations.
//             </p>
//           </div>

//           {/* Feature List */}
//           <div className="space-y-4">
//             {[
//               {
//                 icon: <Users className="w-5 h-5 text-orange-600" />,
//                 title: "Expert Consultations",
//                 description: "1-on-1 sessions with certified nutritionists",
//               },
//               {
//                 icon: <Award className="w-5 h-5 text-orange-600" />,
//                 title: "Proven Results",
//                 description: "95% of clients reach their wellness goals",
//               },
//               {
//                 icon: <Shield className="w-5 h-5 text-orange-600" />,
//                 title: "100% Natural",
//                 description: "Only pure, organic ingredients in all products",
//               },
//             ].map((feature, index) => (
//               <div key={index} className="flex items-start gap-3">
//                 <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-orange-200">
//                   {feature.icon}
//                 </div>
//                 <div>
//                   <h4 className="font-semibold text-gray-900 mb-1">
//                     {feature.title}
//                   </h4>
//                   <p className="text-sm text-gray-600">{feature.description}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Decorative Elements */}
//         <div className="absolute bottom-8 right-8 opacity-20">
//           <div className="w-32 h-32 bg-gradient-to-br from-orange-300 to-amber-400 rounded-full blur-3xl"></div>
//         </div>
//         <div className="absolute top-1/4 right-1/4 opacity-10">
//           <div className="w-24 h-24 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full blur-2xl"></div>
//         </div>
//       </div>

//       {/* Right Side - Auth Component */}
//       <div className="w-full lg:w-1/2 bg-white flex items-center justify-center px-8 py-12">
//         <div className="w-full max-w-md">
//           {/* Logo */}
//           <div className="flex items-center gap-3 mb-12">
//             <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
//               <Leaf className="w-5 h-5 text-white" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-gray-900">Nutra-Vive</h1>
//               <p className="text-sm text-gray-500">Natural Wellness</p>
//             </div>
//           </div>

//           {/* Auth Container */}
//           <div>{children}</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Layout;
"use client";

import React from "react";
import {
  Leaf,
  Shield,
  Sparkles,
  Users,
  Award,
  Headphones,
  ArrowLeft,
} from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Marketing Content */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex-col justify-center px-12 relative">
        {/* WhatsApp Support Badge */}
        <div className="absolute top-8 right-8">
          <a
            href="https://wa.me/9735737764"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-200 hover:bg-white/90 transition-colors"
          >
            <Headphones className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Support</span>
          </a>
        </div>

        <div className="max-w-lg">
          {/* Feature Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-orange-200/50">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Reach wellness goals faster
                </h3>
                <p className="text-gray-600 mb-4">
                  Get personalized nutrition plans with our certified experts.
                  Transform your health naturally.
                </p>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                  Learn more
                </button>
              </div>
            </div>

            {/* Mini Stats */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">10K+</div>
                <div className="text-xs text-gray-500">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">95%</div>
                <div className="text-xs text-gray-500">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">24/7</div>
                <div className="text-xs text-gray-500">Support</div>
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Introducing new features
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our latest nutrition tracking and meal planning tools help you
              make better decisions. Experience personalized wellness like never
              before with recommendations from our health experts.
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-4">
            {[
              {
                icon: <Users className="w-5 h-5 text-orange-600" />,
                title: "Expert Consultations",
                description: "1-on-1 sessions with certified nutritionists",
              },
              {
                icon: <Award className="w-5 h-5 text-orange-600" />,
                title: "Proven Results",
                description: "95% of clients reach their wellness goals",
              },
              {
                icon: <Shield className="w-5 h-5 text-orange-600" />,
                title: "100% Natural",
                description: "Only pure, organic ingredients in all products",
              },
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-orange-200">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-8 right-8 opacity-20">
          <div className="w-32 h-32 bg-gradient-to-br from-orange-300 to-amber-400 rounded-full blur-3xl"></div>
        </div>
        <div className="absolute top-1/4 right-1/4 opacity-10">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* Right Side - Auth Component */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Nutra-Vive</h1>
              <p className="text-sm text-gray-500">Natural Wellness</p>
            </div>
          </div>

          {/* Back to Home Link */}
          <a
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </a>

          {/* Auth Container */}
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
