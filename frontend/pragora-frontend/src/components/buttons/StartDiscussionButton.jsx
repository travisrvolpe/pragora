// src/components/buttons/StartDiscussionButton.jsx
import React from "react";
import { MessageSquare } from "lucide-react";
import Button from "./Button";
import "./Button.css";

const StartDiscussionButton = ({ onClick, disabled }) => (
  <Button
    label="Start Discussion"
    icon={MessageSquare}
    onClick={onClick}
    disabled={disabled}
    className="start-discussion-button"
    tooltip="Start a new discussion"
  />
);

export default StartDiscussionButton;
