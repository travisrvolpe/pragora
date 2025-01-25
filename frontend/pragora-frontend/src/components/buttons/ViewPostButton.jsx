// src/components/buttons/ViewPostButton.jsx
import React from "react";
import { ArrowRight } from "lucide-react";
import Button from "./Button";
import "./Button.css";

const ViewPostButton = ({ onClick, disabled }) => (
  <Button
    label="View Post"
    icon={ArrowRight}
    onClick={onClick}
    disabled={disabled}
    className="view-post-button"
    tooltip="Go to this post"
  />
);

export default ViewPostButton;
