// DiscussionDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function DiscussionDetail() {
  const { id } = useParams();
  const [discussion, setDiscussion] = useState(null);

  useEffect(() => {
    const fetchDiscussion = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/discussions/${id}`);
        setDiscussion(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDiscussion();
  }, [id]);

  if (!discussion) return <p>Loading...</p>;

  return (
    <div>
      <h1>{discussion.title}</h1>
      <p>{discussion.body}</p>
      {/* Add comments and voting functionality here */}
    </div>
  );
}

export default DiscussionDetail;