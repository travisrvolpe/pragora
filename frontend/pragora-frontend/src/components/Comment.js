// Comment.js
import React from 'react';

function Comment({ comment }) {
  return (
    <div className="comment">
      <p>{comment.body}</p>
      <p><small>By: {comment.author}</small></p>
    </div>
  );
}

export default Comment;