// src/components/buttons/Button.jsx
import React from "react";
import PropTypes from "prop-types";
import "./Button.css"; // Shared styles for all buttons


const Button = ({ label, icon: Icon, onClick, className, disabled, tooltip }) => {
  return (
    <button
      className={`button ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={tooltip || label} // Optional tooltip
    >
      {Icon && <Icon className="button-icon" />}
      {label && <span>{label}</span>}
    </button>
  );
};

Button.propTypes = {
  label: PropTypes.string, // Label for the button (optional for icon-only buttons)
  icon: PropTypes.elementType, // Icon component (e.g., from Lucide React)
  onClick: PropTypes.func.isRequired, // Click handler
  className: PropTypes.string, // Additional classes for styling
  disabled: PropTypes.bool, // Disable the button
  tooltip: PropTypes.string, // Optional tooltip
};

Button.defaultProps = {
  label: "",
  className: "",
  disabled: false,
  tooltip: "",
};

export default Button;
