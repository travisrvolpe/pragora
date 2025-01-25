// src/components/buttons/StartPostButton.jsx
import React from "react";
import { MessageSquare } from "lucide-react";
import Button from "./Button";
import "./Button.css";

const StartPostButton = ({ onClick, disabled }) => (
  <Button
    label="Start Post"
    icon={MessageSquare}
    onClick={onClick}
    disabled={disabled}
    className="start-post-button"
    tooltip="Start a new post"
  />
);

export default StartPostButton;
