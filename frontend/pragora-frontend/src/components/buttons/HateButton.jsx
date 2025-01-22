import React from "react";
import Button from "./Button";
import { Slash } from "lucide-react";
import "./Button.css";

const HateButton = ({ onClick, disabled }) => (
  <Button
    label="Hate"
    icon={Slash}
    onClick={onClick}
    disabled={disabled}
    className="hate-button"
    tooltip="Express dislike for this content"
  />
);

export default HateButton;
