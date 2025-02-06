import React from "react";

const FormInput = ({ type, name, value, onChange, placeholder, error }) => (
  <div className="input-container">
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={error ? "error" : ""}
    />
    {error && <span className="error-message">{error}</span>}
  </div>
);

export default FormInput;
