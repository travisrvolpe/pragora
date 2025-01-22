import React from "react";
import Button from "./Button";
import { ThumbsDown } from "lucide-react";
import "./Button.css";

const DislikeButton = ({ onClick, disabled }) => (
  <Button
    label="Dislike"
    icon={ThumbsDown}
    onClick={onClick}
    disabled={disabled}
    className="dislike-button"
    tooltip="Dislike this content"
  />
);

export default DislikeButton;
