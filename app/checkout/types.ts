// app/checkout/types.ts

export interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
  };
  quantity: number;
  price: number;
}

export interface CartData {
  _id: string;
  items: CartItem[];
}

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  deliveryMethod: string;
  notes: string;
  marketingOptIn: boolean;
}

export interface FieldError {
  [key: string]: string;
}

export interface StepErrors {
  [stepNumber: number]: FieldError;
}

export interface CheckoutStep {
  id: number;
  title: string;
  subtitle: string;
  icon: any; // Lucide icon component
  fields: (keyof FormData)[];
}

export interface StepProps {
  formData: FormData;
  onInputChange: (field: keyof FormData, value: string | boolean) => void;
  errors: FieldError;
  subtotal: number;
  shipping: number;
}

export interface USPSAddressData {
  firm?: string;
  streetAddress: string;
  secondaryAddress?: string;
  city?: string;
  state: string;
  ZIPCode?: string;
  ZIPPlus4?: string;
  urbanization?: string;
}

export interface USPSTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface USPSAddressResponse {
  address: {
    firm?: string;
    streetAddress: string;
    secondaryAddress?: string;
    city: string;
    state: string;
    ZIPCode: string;
    ZIPPlus4?: string;
    urbanization?: string;
  };
  additionalInfo?: {
    DPVConfirmation?: string;
    DPVFootnote?: string;
    Business?: string;
    CentralDeliveryPoint?: string;
    Vacant?: string;
  };
  corrections?: string[];
  warnings?: string[];
  matches?: USPSAddressResponse[];
}

export interface USPSCityStateResponse {
  city: string;
  state: string;
  ZIPCode: string;
}

export interface USPSApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface AddressValidationResult
  extends USPSApiResult<USPSAddressResponse> {
  isValid?: boolean;
  standardizedAddress?: USPSAddressResponse["address"];
}

export interface ComprehensiveValidationResult {
  original: USPSAddressData;
  isValid: boolean;
  standardized: USPSAddressResponse | null;
  corrections: string[];
  warnings: string[];
  suggestions: USPSAddressResponse[];
}
