import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, TrendingUp, BookOpen, Users, MessageSquare, Award } from "lucide-react";
import axios from "axios";
import StartPostButton from "../components/buttons/StartPostButton";
//import PostCard from "../components/PostCard";
import PostFeed from "../components/PostFeed";
import "../styles/pages/DialecticaHome.css";
import {GiCardRandom} from "react-icons/gi";
import {FaRandom} from "react-icons/fa";

const DialecticaHomepage = () => {
  const [selectedTab, setSelectedTab] = useState("trending");
  const [selectedCategory, setSelectedCategory] = useState(null);
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

      if (response.data.status === 'success') {
        setPosts(current =>
          page === 0 ? response.data.data.posts : [...current, ...response.data.data.posts]
        );
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page, selectedTab, selectedCategory]);

  const categories = [
    { id: "self", name: "Self-Development" },
    { id: "home", name: "Home & Habitat" },
    { id: "nature", name: "Nature & Environment" },
    { id: "science", name: "Science & Technology" },
    { id: "philosophy", name: "Philosophy" },
    { id: "economics", name: "Economics & Business" },
    { id: "society", name: "Society & Culture" },
    { id: "civics", name: "Civic Engagement" },
    { id: "entertainment", name: "Entertainment" },
    { id: "misc", name: "Miscellaneous" },
  ];
  /* need to add subcategories with categories as parent
  const subcategories = [
    main category Self-Development sub categories Health & Wellness, Personal Growth, Skill Development
    main category Home & Habitat sub categories Home Design & Organization, Gardening & Landscaping, DIY, IOT / Smart Homes,
    main category Nature & Environment sub categories
    main category Science & Technology sub categories Natural Sciences, Special Sciences, Technology & Engineering, Mathematics
    main category Economics & Business sub categories Economics, Personal Finance, Entrepreneurship, Market Trends & Analysis
    main category Philosophy sub categories Metaphysics, Epistemology, Ethics, Logic, Applied Philosophy
    main category Society & Culture sub categories Social Sciences, Arts & Humanities, History, Politics & Policy
    main category Civic Engagement sub categories Community Building, Volunteerism & Activism, Local Governance
    main category Entertainment sub categories Pop Culture, Comedy, Media Reviews, Creative Projects

  ]; */

  const handleViewPost = (id) => {
    navigate(`/post/${id}`);
  };

  return (
      <div className="dialectica-container">
        {/* Header Section */}
        <div className="header-section">
          <div className="search-container">
            <input type="text" placeholder="Search post ..." className="search-input"/>
            <Search className="search-icon"/>
          </div>
          <StartPostButton onClick={() => navigate("/create-content")}/>
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

        {/* Post Feed */}
        <div className="post-feed">
          {isLoading && post.length === 0 ? (
              <div>Loading post...</div>
          ) : (
              post.map((post) => (
                  <PostFeed
                      key={post.post_id}
                      post={{
                        id: post.post_id,
                        title: post.title,
                        author: post.user_id, // You'll need to fetch user details
                        preview: post.content,
                        engagement: `Posted ${new Date(post.created_at).toLocaleDateString()}`
                      }}
                      onViewPost={handleViewPost}
                  />
              ))
          )}
        </div>
      </div>
  );
};

export default DialecticaHomepage;
