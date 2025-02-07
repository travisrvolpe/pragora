// src/components/buttons/BackButton.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from './button';
import { NavigationButtonProps } from '../../types/buttons';

const BackButton: React.FC<NavigationButtonProps> = ({ className }) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(-1);
  };

  return (
    <Button
      icon={ArrowLeft}
      label="Back"
      onClick={handleClick}
      className={className}
    />
  );
};

export default BackButton;
