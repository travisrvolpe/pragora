import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/components/TopicCard.css";

const TopicCard = ({ category, isSelected, onSelect, subcategories, onSubcategoryChange }) => {
  const navigate = useNavigate();

  return (
    <div className="topic-card">
      <div className="topic-header">
        <button
          className={`topic-button ${isSelected ? "selected" : ""}`}
          onClick={() => onSelect(category.id)}
        >
          {category.name}
        </button>

        {subcategories && subcategories.length > 0 && (
          <select
            className="subcategory-dropdown"
            onChange={onSubcategoryChange}
            defaultValue=""
          >
            <option value="">All Subcategories</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory} value={subcategory}>
                {subcategory}
              </option>
            ))}
          </select>
        )}

        <button
          className="go-to-button"
          onClick={() => navigate(`/topics/${category.id}`)}
        >
          Go To
        </button>
      </div>
    </div>
  );
};

export default TopicCard;