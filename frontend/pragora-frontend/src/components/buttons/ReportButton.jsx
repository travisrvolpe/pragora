import React from "react";
import Button from "./button";
import { Flag } from "lucide-react";
import "./Button.css";

const ReportButton = ({ onClick, disabled }) => (
  <Button
    label="Report"
    icon={Flag}
    onClick={onClick}
    disabled={disabled}
    className="report-button"
    tooltip="Report this content"
  />
);

export default ReportButton;
