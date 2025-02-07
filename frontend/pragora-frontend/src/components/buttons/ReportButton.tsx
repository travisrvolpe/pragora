// src/components/buttons/ReportButton.tsx
import React from "react";
import Button from "./button";
import { Flag } from "lucide-react";
import { BaseButtonProps } from "../../types/buttons";

const ReportButton: React.FC<BaseButtonProps> = ({ onClick, disabled }) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) onClick(e);
  };

  return (
    <Button
      label="Report"
      icon={Flag}
      onClick={handleClick}
      disabled={disabled}
      className="report-button"
      tooltip="Report this content"
    />
  );
};

export default ReportButton;