import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';

const BackButton = () => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.stopPropagation();
    navigate(-1);
  };

  return (
    <Button
      icon={ArrowLeft}
      label="Back"
      onClick={handleClick}
      className="bg-gray-900 text-white hover:bg-gray-800"
    />
  );
};

export default BackButton;