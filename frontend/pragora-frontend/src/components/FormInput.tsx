import React, { InputHTMLAttributes } from "react";

// Extend HTML input props while adding our custom props
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
  ...props // Spread remaining props like autoComplete, required, etc.
}) => (
  <div className="input-container">
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${error ? "error" : ""} ${className}`.trim()}
      {...props}
    />
    {error && <span className="error-message">{error}</span>}
  </div>
);

export default FormInput;