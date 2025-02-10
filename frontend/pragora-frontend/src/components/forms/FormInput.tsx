// src/components/forms/FormInput.tsx
'use client'

import React, { InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  type,
  name,
  value,
  onChange,
  placeholder,
  error,
  className = "",
  ...props
}) => (
  <div className="mb-4">
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
        error 
          ? 'border-red-500 placeholder-red-300'
          : 'border-gray-300 placeholder-gray-500'
      } text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm ${className}`.trim()}
      {...props}
    />
    {error && (
      <p className="mt-2 text-sm text-red-600">{error}</p>
    )}
  </div>
);

export default FormInput;