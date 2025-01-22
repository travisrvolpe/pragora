import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp, BookOpen, Users, MessageSquare, Award } from "lucide-react";
import StartDiscussionButton from "../components/buttons/StartDiscussionButton";
import DiscussionCard from "../components/DiscussionCard";
import "../styles/pages/DialecticaHome.css";

const DialecticaHomepage = () => {
  const [selectedTab, setSelectedTab] = useState("trending");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  const categories = [
    { id: "science", name: "Science & Technology" },
    { id: "society", name: "Society & Culture" },
    { id: "philosophy", name: "Philosophy & Ethics" },
    { id: "economics", name: "Economics & Business" },
    { id: "politics", name: "Politics & Policy" },
    { id: "arts", name: "Arts & Humanities" },
    { id: "health", name: "Health & Wellness" },
    { id: "environment", name: "Environment & Sustainability" },
  ];

  const mockDiscussions = [
    {
      id: 1,
      title: "Evidence-Based Approaches to Sustainable Urban Planning",
      author: "Dr. Sarah Chen",
      topic: "society",
      engagement: "126 contributions • 85% quality score",
      preview: "An analysis of data-driven methods for creating more sustainable and livable cities...",
      tags: ["Research-Backed", "Implementation Focus", "Community Impact"],
    },
    {
      id: 2,
      title: "Practical Strategies for Reducing Carbon Footprint in SMEs",
      author: "Michael Roberts",
      topic: "science",
      engagement: "94 contributions • 92% quality score",
      preview: "Examining cost-effective approaches for small businesses to implement sustainable practices...",
      tags: ["Case Study", "Actionable Steps", "Verified Results"],
    },
  ];

  const filteredDiscussions = selectedCategory
    ? mockDiscussions.filter((discussion) => discussion.topic === selectedCategory)
    : mockDiscussions;

  const handleViewDiscussion = (id) => {
    navigate(`/discussions/${id}`);
  };

  return (
    <div className="dialectica-container">
      {/* Header Section */}
      <div className="header-section">
        <div className="search-container">
          <input type="text" placeholder="Search discussions ..." className="search-input" />
          <Search className="search-icon" />
        </div>
          <StartDiscussionButton onClick={() => navigate("/create-content")} />
      </div>

      {/* Filter Dropdown */}
      <div className="filter-buttons">
        <button className="filter-button">All</button>
        <button className="filter-button">Popular</button>
        <button className="filter-button">Recent</button>
      </div>

      {/* Category Navigation */}
      <div className="category-nav">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-button ${selectedCategory === category.id ? "active" : ""}`}
            onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <button
          onClick={() => setSelectedTab("trending")}
          className={`nav-tab ${selectedTab === "trending" ? "active" : ""}`}
        >
          <div className="nav-tab-content">
            <TrendingUp className="tab-icon" />
            Trending
          </div>
        </button>
        <button
          onClick={() => setSelectedTab("best")}
          className={`nav-tab ${selectedTab === "best" ? "active" : ""}`}
        >
          <div className="nav-tab-content">
            <Award className="tab-icon" />
            Best
          </div>
        </button>
        <button
          onClick={() => setSelectedTab("recent")}
          className={`nav-tab ${selectedTab === "recent" ? "active" : ""}`}
        >
          <div className="nav-tab-content">
            <BookOpen className="tab-icon" />
            Recent
          </div>
        </button>
        <button
          onClick={() => setSelectedTab("following")}
          className={`nav-tab ${selectedTab === "following" ? "active" : ""}`}
        >
          <div className="nav-tab-content">
            <Users className="tab-icon" />
            Following
          </div>
        </button>
      </div>

      {/* Discussion Feed */}
      <div className="discussion-feed">
        {filteredDiscussions.map((discussion) => (
          <DiscussionCard
            key={discussion.id}
            discussion={discussion}
            onViewDiscussion={handleViewDiscussion}
            onLike={(id) => console.log("Liked discussion:", id)}
            onDislike={(id) => console.log("Disliked discussion:", id)}
            onSave={(id) => console.log("Saved discussion:", id)}
            onShare={(id) => console.log("Shared discussion:", id)}
            onLove={(id) => console.log("Loved discussion:", id)}
            onHate={(id) => console.log("Hated discussion:", id)}
          />
        ))}
      </div>
    </div>
  );
};

export default DialecticaHomepage;
