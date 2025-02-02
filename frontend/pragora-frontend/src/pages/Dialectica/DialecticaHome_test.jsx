import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {Award, BookOpen, Search, TrendingUp, Users} from "lucide-react";
import axios from "axios";
import StartPostButton from "../../components/buttons/StartPostButton";
import PostFeed from "../../components/posts/PostFeed";
import TopicCard from "../../components/TopicCard";
import "../../styles/pages/DialecticaHome.css";
import {FaRandom} from "react-icons/fa";

const DialecticaHomepage = () => {
  const [selectedTab, setSelectedTab] = useState("trending");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const navigate = useNavigate();
  const [post, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/posts?skip=${page * 20}&limit=20`,
        { withCredentials: true }
      );

      if (response.data.status === "success") {
        setPosts(current =>
          page === 0 ? response.data.data.posts : [...current, ...response.data.data.posts]
        );
      }
    } catch (error) {
      console.error("Failed to fetch post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, selectedCategory, selectedTab, selectedSubcategory]);

  const categories = [
    { id: "self", name: "Self-Development", subcategories: ["Health & Wellness", "Personal Growth", "Skill Development"] },
    { id: "home", name: "Home & Habitat", subcategories: ["Home Design", "Gardening"] },
    { id: "nature", name: "Nature & Environment", subcategories: ["Sustainability", "Conservation"] },
    { id: "science", name: "Science & Technology", subcategories: ["Engineering", "AI"] },
    { id: "philosophy", name: "Philosophy", subcategories: ["Ethics", "Metaphysics"] },
    { id: "economics", name: "Economics & Business", subcategories: ["Finance", "Entrepreneurship"] },
    { id: "society", name: "Society & Culture", subcategories: ["Politics", "History"] },
    { id: "civics", name: "Civic Engagement", subcategories: ["Volunteerism", "Governance"] },
    { id: "entertainment", name: "Entertainment", subcategories: ["Pop Culture", "Media"] },
    { id: "misc", name: "Miscellaneous", subcategories: [] },
  ];

  const handleCategorySelect = (id) => {
    setSelectedCategory(selectedCategory === id ? null : id);
    setSelectedSubcategory(null);
    setPage(0);
  };

  const handleSubcategoryChange = (e) => {
    setSelectedSubcategory(e.target.value);
    setPage(0);
  };

  const handleViewPost = (id) => {
    navigate(`/post/${id}`);
  };

  return (
    <div className="dialectica-container">
      <div className="header-section">
        <div className="search-container">
          <input type="text" placeholder="Search post ..." className="search-input" />
          <Search className="search-icon" />
        </div>
        <StartPostButton onClick={() => navigate("/create-content")} />
      </div>

      <div className="topics-container">
        {categories.map((category) => (
          <TopicCard
            key={category.id}
            category={category}
            isSelected={selectedCategory === category.id}
            onSelect={handleCategorySelect}
            subcategories={category.subcategories}
            onSubcategoryChange={(e) => handleSubcategoryChange(e)}
          />
        ))}
      </div>

      {/* Navigation Tabs */}
        <div className="nav-tabs">
          <button
              onClick={() => setSelectedTab("trending")}
              className={`nav-tab ${selectedTab === "trending" ? "active" : ""}`}
          >
            <div className="nav-tab-content">
              <TrendingUp className="tab-icon"/>
              Trending
            </div>
          </button>
          <button
              onClick={() => setSelectedTab("best")}
              className={`nav-tab ${selectedTab === "best" ? "active" : ""}`}
          >
            <div className="nav-tab-content">
              <Award className="tab-icon"/>
              Best
            </div>
          </button>
          <button
              onClick={() => setSelectedTab("recent")}
              className={`nav-tab ${selectedTab === "recent" ? "active" : ""}`}
          >
            <div className="nav-tab-content">
              <BookOpen className="tab-icon"/>
              Recent
            </div>
          </button>
          <button
              onClick={() => setSelectedTab("following")}
              className={`nav-tab ${selectedTab === "following" ? "active" : ""}`}
          >
            <div className="nav-tab-content">
              <Users className="tab-icon"/>
              Following
            </div>
          </button>

          <button
              onClick={() => setSelectedTab("randomize")}
              className={`nav-tab ${selectedTab === "randomize" ? "active" : ""}`}
          >
            <div className="nav-tab-content">
              <FaRandom className="tab-icon"/>
              Random
            </div>
          </button>
        </div>

      <div className="post-feed">
        {isLoading && post.length === 0 ? (
          <div>Loading post...</div>
        ) : (
          post.map((post) => (
            <PostFeed
              key={post.post_id}
              post={{
                id: post.post_id,
                post_type_id: post.post_type_id,
                title: post.title,
                author: post.user_id,
                preview: post.content,
                engagement: `Posted ${new Date(post.created_at).toLocaleDateString()}`,
              }}
              onViewPost={() => navigate(`/post/${post.post_id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default DialecticaHomepage;
