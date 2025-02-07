import React from "react";
import { useLocation } from "react-router-dom";
import { SidebarProps } from '../../types/layout';
import TopicCard from "../TopicCard";
import "../../styles/layout.css";

const Sidebar: React.FC<SidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onSubcategoryChange
}) => {
  const location = useLocation();

  const getSidebarContent = () => {
    if (location.pathname.startsWith("/dialectica")) {
      return categories.map((category) => (
        <TopicCard
          key={category.id}
          category={category}
          isSelected={selectedCategory === category.id}
          onSelect={onSelectCategory}
          subcategories={category.subcategories}
          onSubcategoryChange={onSubcategoryChange}
        />
      ));
    } else if (location.pathname.startsWith("/tap")) {
      return <p className="sidebar-placeholder">TAP Sidebar Content</p>;
    } else if (location.pathname.startsWith("/pan")) {
      return <p className="sidebar-placeholder">PAN Sidebar Content</p>;
    } else {
      return <p className="sidebar-placeholder">General Sidebar Content</p>;
    }
  };

  return (
    <div className="sidebar">
      <h3 className="sidebar-title">Navigation</h3>
      {getSidebarContent()}
    </div>
  );
};

export default Sidebar;