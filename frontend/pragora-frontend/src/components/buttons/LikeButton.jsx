import React from "react";
import Button from "../ui/Button";
import { ThumbsUp } from "lucide-react";
import "./Button.css";

const LikeButton = ({ onClick, disabled }) => (
  <Button
    label="Like"
    icon={ThumbsUp}
    onClick={onClick}
    disabled={disabled}
    className="like-button"
    tooltip="Like this content"
  />
);

export default LikeButton;
