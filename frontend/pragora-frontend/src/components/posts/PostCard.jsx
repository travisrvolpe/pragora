// This is now redundant with the addition of post card factory and base post card. Remove or use a default fallback.

import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import {
  LikeButton,
  DislikeButton,
  LoveButton,
  HateButton,
  SaveButton,
  ShareButton,
  ReportButton,
  ViewPostButton
} from "../buttons";

const PostCard = ({
  post,
  variant = "feed", // "feed" or "full"
  onBack,
  onViewPost,
  onLike,
  onDislike,
  onLove,
  onHate,
  onSave,
  onShare,
  onReport
}) => {
  const renderMetadata = () => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span className="font-medium">{post.author?.name || post.user_id || 'Anonymous'}</span>
        {post.author?.credentials && (
          <span className="text-gray-500">({post.author.credentials})</span>
        )}
        {post.author?.reputation && (
          <span className="text-blue-600">
            Rep: {post.author.reputation}
          </span>
        )}
      </div>

      <div className="text-sm text-gray-500">
        Posted: {new Date(post.created_at || post.metadata?.posted).toLocaleDateString()}
        {(post.updated_at || post.metadata?.lastEdited) &&
          ` • Edited: ${new Date(post.updated_at || post.metadata?.lastEdited).toLocaleDateString()}`
        }
      </div>
    </div>
  );

  const renderContent = () => (
      <>
          {variant === "full" && post.summary && (
              <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Summary</h2>
                  <p className="text-gray-700">{post.summary}</p>
              </div>
          )}

          <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                  __html: variant === "feed"
                      ? (post.preview || post.content).substring(0, 500) + (post.content.length > 500 ? '...' : '')
                      : post.content
              }}
          />

          {variant === "full" && post.references?.length > 0 && (
              <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">References</h3>
                  <ul className="list-disc list-inside text-gray-700">
                      {post.references.map((ref, index) => (
                          <li key={index}>{ref}</li>
                      ))}
                  </ul>
              </div>
          )}

          {post.tags?.length > 0 && (
              <div className="flex gap-2 mt-6 flex-wrap">
                  {post.tags.map((tag, index) => (
                      <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
              {tag}
            </span>
                  ))}
              </div>
          )}
      </>
  );

    const renderActions = () => (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <LikeButton onClick={() => onLike?.(post.post_id)}
                            count={post.metrics?.likes || post.likes_count || 0}/>
                <DislikeButton onClick={() => onDislike?.(post.post_id)} count={post.metrics?.dislikes || post.dislikes_count || 0} />
        {variant === "feed" && (
          <>
            <LoveButton onClick={() => onLove?.(post.post_id)} count={post.metrics?.loves || post.loves_count || 0} />
            <HateButton onClick={() => onHate?.(post.post_id)} count={post.metrics?.hates || post.hates_count || 0} />
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <SaveButton onClick={() => onSave?.(post.post_id)} count={post.metrics?.saves || post.saves_count || 0} />
        <ShareButton onClick={() => onShare?.(post.post_id)} />
        <ReportButton onClick={() => onReport?.(post.post_id)} />
        {variant === "feed" && (
          <ViewPostButton onClick={() => onViewPost?.(post.post_id)} />
        )}
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      {variant === "full" && onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 p-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Posts
        </button>
      )}

      <CardHeader>
        <CardTitle className="text-2xl">{post.title}</CardTitle>
        {renderMetadata()}
      </CardHeader>

      <CardContent>
        {renderContent()}
      </CardContent>

      <CardFooter className="bg-gray-50 border-t">
        {renderActions()}
      </CardFooter>
    </Card>
  );
};

export default PostCard;