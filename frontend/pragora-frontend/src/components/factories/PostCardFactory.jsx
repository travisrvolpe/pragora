import React from "react";
import ThoughtPostCard from "../posts/ThoughtPostCard";
import ImagePostCard from "../posts/ImagePostCard";
import ArticlePostCard from "../posts/ArticlePostCard";

const POST_TYPES = {
  Thought: 1,
  Image: 2,
  Article: 3
};

const PostCardFactory = ({ post, variant={variant}, ...props }) => {
  // Enhanced debug logging
  console.log("PostCardFactory received variant:", variant);
  console.log("PostCardFactory received:", {
    post_id: post.post_id,
    user_id: post.user_id,
    username: post.username,
    avatar_img: post.avatar_img,
    post_type_id: post.post_type_id,
    content: post.content?.substring(0, 50), // First 50 chars of content
    full_post: post // Log full post object
  });

  const getPostComponent = () => {
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
  console.log(`Selected component: ${PostComponent.name}`);

  // Ensure we pass all user-related props
  const postWithUserData = {
    ...post,
    username: post.username || 'Anonymous',
    avatar_img: post.avatar_img || null,
    reputation_score: post.reputation_score || 0,
    reputation_cat: post.reputation_cat || '',
    expertise_area: post.expertise_area || '',
  };

  return <PostComponent post={postWithUserData} variant={variant} {...props} />;
};

export default PostCardFactory;