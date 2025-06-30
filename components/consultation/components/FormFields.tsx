import React from "react";

interface InputFieldProps {
  label: string;
  type: string;
  value: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  error,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && "*"}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => {
          if (type === "number") {
            onChange(parseInt(e.target.value) || 0);
          } else {
            onChange(e.target.value);
          }
        }}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  error?: string;
  placeholder?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  required = false,
  error,
  placeholder = "Select an option",
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && "*"}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

interface TextareaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  error?: string;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  required = false,
  error,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && "*"}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all resize-none"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

interface CheckboxGroupProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (value: string, checked: boolean) => void;
  required?: boolean;
  error?: string;
  gridCols?: string;
  colorClass?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  required = false,
  error,
  gridCols = "grid-cols-2 md:grid-cols-3",
  colorClass = "emerald",
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {label} {required && "*"}
      </label>
      <div className={`grid ${gridCols} gap-3`}>
        {options.map((option) => (
          <label key={option} className="relative cursor-pointer">
            <input
              type="checkbox"
              checked={selectedValues.includes(option)}
              onChange={(e) => onChange(option, e.target.checked)}
              className="sr-only"
            />
            <div
              className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                selectedValues.includes(option)
                  ? `border-${colorClass}-500 bg-${colorClass}-50 text-${colorClass}-700`
                  : "border-gray-200 hover:border-" + colorClass + "-300"
              }`}
            >
              <div className="text-sm font-medium">{option}</div>
            </div>
          </label>
        ))}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

interface RadioGroupProps {
  label: string;
  options: { value: string; label: string; desc?: string }[];
  selectedValue: string;
  onChange: (value: string) => void;
  name: string;
  required?: boolean;
  error?: string;
  gridCols?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  options,
  selectedValue,
  onChange,
  name,
  required = false,
  error,
  gridCols = "grid-cols-1 md:grid-cols-2",
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {label} {required && "*"}
      </label>
      <div className={`grid ${gridCols} gap-3`}>
        {options.map((option) => (
          <label key={option.value} className="relative cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
            />
            <div
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                selectedValue === option.value
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 hover:border-emerald-300"
              }`}
            >
              <div className="font-medium text-gray-800 mb-1">
                {option.label}
              </div>
              {option.desc && (
                <div className="text-sm text-gray-600">{option.desc}</div>
              )}
            </div>
          </label>
        ))}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

interface RangeSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  showValue?: boolean;
  valueLabel?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  showValue = true,
  valueLabel = "",
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        {label} {showValue && `(${value}${valueLabel})`}
      </label>
      <div className="px-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Low ({min})</span>
          <span>Medium ({Math.round((min + max) / 2)})</span>
          <span>High ({max})</span>
        </div>
      </div>
    </div>
  );
};
