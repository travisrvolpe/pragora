import React from "react";
import Button from "./Button";
import { BookmarkPlus } from "lucide-react";
import "./Button.css";

const SaveButton = ({ onClick, disabled }) => (
  <Button
    label="Save"
    icon={BookmarkPlus}
    onClick={onClick}
    disabled={disabled}
    className="save-button"
    tooltip="Save this content for later"
  />
);

export default SaveButton;
