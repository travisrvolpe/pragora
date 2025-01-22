// src/components/buttons/ViewDiscussionButton.jsx
import React from "react";
import { ArrowRight } from "lucide-react";
import Button from "./Button";
import "./Button.css";

const ViewDiscussionButton = ({ onClick, disabled }) => (
  <Button
    label="View Discussion"
    icon={ArrowRight}
    onClick={onClick}
    disabled={disabled}
    className="view-discussion-button"
    tooltip="Go to this discussion"
  />
);

export default ViewDiscussionButton;
