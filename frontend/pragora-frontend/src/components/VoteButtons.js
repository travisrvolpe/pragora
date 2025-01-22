// VoteButtons.js
import React from 'react';

function VoteButtons({ onUpvote, onDownvote, score }) {
  return (
    <div className="vote-buttons">
      <button onClick={onUpvote}>⬆️</button>
      <span>{score}</span>
      <button onClick={onDownvote}>⬇️</button>
    </div>
  );
}

export default VoteButtons;