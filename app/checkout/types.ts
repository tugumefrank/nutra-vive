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
