// src/components/buttons/ViewPostButton.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import Button from './button';
import { BaseButtonProps } from '../../types/buttons';

// Create a specific interface for ViewPostButton props
interface ViewPostButtonProps extends Omit<BaseButtonProps, 'onClick'> {
  postId: number;
}

const ViewPostButton: React.FC<ViewPostButtonProps> = ({ 
  postId, 
  className,
  ...props 
}) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    navigate(`/post/${postId}`);
  };

  return (
    <Button
      {...props}
      icon={Eye}
      label="View"
      onClick={handleClick}
      className={`bg-gray-900 text-white hover:bg-gray-800 ${className || ''}`}
    />
  );
};

export default ViewPostButton;