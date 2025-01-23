import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/pages/CreateContent.css";

const CreateContent = () => {
  const [selectedType, setSelectedType] = useState("thoughts");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isDraft, setIsDraft] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const postData = {
      type: selectedType,
      title,
      content,
      isDraft,
    };
    // Simulate API call
    console.log("Post submitted:", postData);
    alert(isDraft ? "Draft saved!" : "Post published!");
    navigate("/"); // Redirect to home page after submission
  };

  const renderFormFields = () => {
    switch (selectedType) {
      case "thoughts":
        return (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            className="content-input"
          />
        );
      case "image":
        return (
          <>
            <input
              type="file"
              accept="image/*"
              className="file-input"
              onChange={(e) => console.log("Image selected:", e.target.files[0])}
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add a caption (optional)"
              rows={2}
              className="content-input"
            />
          </>
        );
      case "article":
        return (
          <>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your article..."
              rows={10}
              className="content-input"
            />
          </>
        );
      case "debate":
        return (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Pose your argument or question to start the debate..."
            rows={5}
            className="content-input"
          />
        );
      case "journal":
        return (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write privately for your own reflection..."
            rows={5}
            className="content-input"
          />
        );
      case "brainstorm":
        return (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your ideas or thoughts to brainstorm..."
            rows={5}
            className="content-input"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="create-content-container">
      <h1>Create Content</h1>
      <p>What do you want to do?</p>

      {/* Main Options */}
      <div className="main-options">
        <button
          onClick={() => setSelectedType("thoughts")}
          className={`option-button ${selectedType === "thoughts" ? "active" : ""}`}
        >
          Share Thoughts
        </button>
        <button
          onClick={() => setSelectedType("image")}
          className={`option-button ${selectedType === "image" ? "active" : ""}`}
        >
          Share Image
        </button>
        <button
          onClick={() => setSelectedType("article")}
          className={`option-button ${selectedType === "article" ? "active" : ""}`}
        >
          Write Article
        </button>
      </div>

      {/* Advanced Options */}
      <div className="advanced-options">
        <label htmlFor="advanced-options-dropdown">Advanced Options:</label>
        <select
          id="advanced-options-dropdown"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="debate">Start Debate</option>
          <option value="journal">Create Journal</option>
          <option value="brainstorm">Start Brainstorm</option>
        </select>
      </div>

      {/* Dynamic Form Fields */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="title-input"
        />
        {renderFormFields()}
        <div className="action-buttons">
          <button
            type="button"
            onClick={() => {
              setIsDraft(true);
              handleSubmit();
            }}
            className="draft-button"
          >
            Save Draft
          </button>
          <button
            type="submit"
            onClick={() => setIsDraft(false)}
            className="publish-button"
          >
            Publish
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateContent;
