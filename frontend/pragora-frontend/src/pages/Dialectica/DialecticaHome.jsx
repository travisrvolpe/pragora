// DialecticaHome.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Award, BookOpen, Search, TrendingUp, Users } from "lucide-react";
import { FaRandom } from "react-icons/fa";
import StartPostButton from "../../components/buttons/StartPostButton";
import PostFeed from "../../components/posts/PostFeed";
import TopicCard from "../../components/TopicCard";
import "../../styles/pages/DialecticaHome.css";

const CATEGORIES = [
  {
    id: "self",
    name: "Self-Development",
    subcategories: ["Health & Wellness", "Personal Growth", "Skill Development"]
  },
  {
    id: "home",
    name: "Home & Habitat",
    subcategories: ["Home Design", "Gardening"]
  },
  {
    id: "nature",
    name: "Nature & Environment",
    subcategories: ["Sustainability", "Conservation"]
  },
  {
    id: "science",
    name: "Science & Technology",
    subcategories: ["Engineering", "AI"]
  },
  {
    id: "philosophy",
    name: "Philosophy",
    subcategories: ["Ethics", "Metaphysics"]
  },
  {
    id: "economics",
    name: "Economics & Business",
    subcategories: ["Finance", "Entrepreneurship"]
  },
  {
    id: "society",
    name: "Society & Culture",
    subcategories: ["Politics", "History"]
  },
  {
    id: "civics",
    name: "Civic Engagement",
    subcategories: ["Volunteerism", "Governance"]
  },
  {
    id: "entertainment",
    name: "Entertainment",
    subcategories: ["Pop Culture", "Media"]
  },
  {
    id: "misc",
    name: "Miscellaneous",
    subcategories: []
  }
];

const TABS = [
  { id: "trending", icon: TrendingUp, label: "Trending" },
  { id: "best", icon: Award, label: "Best" },
  { id: "recent", icon: BookOpen, label: "Recent" },
  { id: "following", icon: Users, label: "Following" },
  { id: "randomize", icon: FaRandom, label: "Random" }
];

const DialecticaHomepage = () => {
  const navigate = useNavigate();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("trending");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // Handler functions
  const handleCategorySelect = (id) => {
    setSelectedCategory(selectedCategory === id ? null : id);
    setSelectedSubcategory(null);
  };

  const handleSubcategoryChange = (e) => {
    setSelectedSubcategory(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  const handleCreateContent = () => {
    navigate("/create-content");
  };

  // Render functions
  const renderHeader = () => (
    <div className="header-section">
      <form onSubmit={handleSearch} className="search-container">
        <input
          type="text"
          placeholder="Search posts..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" className="search-button">
          <Search className="search-icon" />
        </button>
      </form>
      <StartPostButton onClick={handleCreateContent} />
    </div>
  );

  const renderTopics = () => (
    <div className="topics-container">
      {CATEGORIES.map((category) => (
        <TopicCard
          key={category.id}
          category={category}
          isSelected={selectedCategory === category.id}
          onSelect={() => handleCategorySelect(category.id)}
          subcategories={category.subcategories}
          onSubcategoryChange={handleSubcategoryChange}
          selectedSubcategory={selectedSubcategory}
        />
      ))}
    </div>
  );

  const renderTabs = () => (
    <div className="nav-tabs">
      {TABS.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setSelectedTab(id)}
          className={`nav-tab ${selectedTab === id ? "active" : ""}`}
        >
          <div className="nav-tab-content">
            <Icon className="tab-icon" />
            {label}
          </div>
        </button>
      ))}
    </div>
  );

  const renderFeed = () => (
    <div className="feed-container">
      <PostFeed
        selectedTab={selectedTab}
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        searchQuery={searchQuery}
      />
    </div>
  );

  return (
    <main className="dialectica-container">
      {renderHeader()}
      {renderTopics()}
      {renderTabs()}
      {renderFeed()}
    </main>
  );
};

export default DialecticaHomepage;
