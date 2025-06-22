import React from "react";
import { CheckCircle } from "lucide-react";

export const SuccessModal: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="max-w-md w-full text-center bg-white rounded-2xl p-8 shadow-2xl">
        <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h2>
        <p className="text-gray-600">
          Your consultation has been booked. We'll contact you within 24 hours.
        </p>
      </div>
    </div>
  );
};
