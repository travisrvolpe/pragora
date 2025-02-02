// PostCardFactory.jsx
import React from "react";
import ThoughtPostCard from "../posts/ThoughtPostCard";
import ImagePostCard from "../posts/ImagePostCard";
import ArticlePostCard from "../posts/ArticlePostCard";

const POST_TYPES = {
  Thought: 1,
  Image: 2,
  Article: 3
};

const PostCardFactory = ({ post, variant = "feed", ...props }) => {
  // Enhanced debug logging
  console.log("PostCardFactory received:", {
    post_id: post.post_id,
    post_type_id: post.post_type_id,
    image_url: post.image_url,
    content: post.content?.substring(0, 50), // First 50 chars of content
    has_title: !!post.title,
    variant,
    full_post: post // Log full post object
  });

  const getPostComponent = () => {
    // Log before switch statement
    console.log(`Determining component for post_type_id: ${post.post_type_id}`);

    switch (post.post_type_id) {
      case POST_TYPES.Thought:
        console.log("Rendering ThoughtPostCard");
        return ThoughtPostCard;
      case POST_TYPES.Image:
        console.log("Rendering ImagePostCard");
        return ImagePostCard;
      case POST_TYPES.Article:
        console.log("Rendering ArticlePostCard");
        return ArticlePostCard;
      default:
        console.warn(
          `Unknown post type: ${post.post_type_id}, defaulting to ThoughtPostCard`,
          {post}
        );
        return ThoughtPostCard;
    }
  };

  const PostComponent = getPostComponent();

  // Log final component selection
  console.log(`Selected component: ${PostComponent.name}`);

  return <PostComponent post={post} variant={variant} {...props} />;
};

export default PostCardFactory;