import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import Button from '../ui/Button';

const ViewPostButton = ({ post_id }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.stopPropagation();
    // Using the /post/:post_id route to match your AppRoutes
    navigate(`/post/${post_id}`);
  };

  return (
    <Button
      icon={Eye}
      label="View"
      onClick={handleClick}
      className="bg-gray-900 text-white hover:bg-gray-800"
    />
  );
};

export default ViewPostButton;