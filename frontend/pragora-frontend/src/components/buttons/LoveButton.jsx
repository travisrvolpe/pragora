import React from "react";
import Button from "../ui/Button";
import { Heart } from "lucide-react";
import "./Button.css";

const LoveButton = ({ onClick, disabled }) => (
  <Button
    label="Love"
    icon={Heart}
    onClick={onClick}
    disabled={disabled}
    className="love-button"
    tooltip="Show love for this content"
  />
);

export default LoveButton;
