import React, { useState, useEffect } from "react";
import axios from "axios";

function ContentPage() {
  const [content, setContent] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  // Fetch content from the API
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/content/")
      .then((response) => setContent(response.data))
      .catch((error) => console.error(error));
  }, []);

  // Handle form submission to create new content
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://127.0.0.1:8000/content/", { title, body })
      .then((response) => {
        setContent([...content, response.data]);
        setTitle("");
        setBody("");
      })
      .catch((error) => console.error(error));
  };

  return (
    <div>
      <h1>Manage Content</h1>

      {/* Form to create new content */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Body"
        />
        <button type="submit">Submit</button>
      </form>

      {/* Display content */}
      <ul>
        {content.map((item) => (
          <li key={item.id}>
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ContentPage;
