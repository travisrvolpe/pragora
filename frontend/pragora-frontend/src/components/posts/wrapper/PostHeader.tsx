// components/posts/wrapper/PostHeader.tsx
import { FC } from 'react';
import { MoreHorizontal, Flag } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from '@/components/user/UserAvatar';
import { PostComponentProps } from './types';
import { formatDate } from '@/applib/utils/utils';
import { PostTypeId } from '@/types/posts/post-types';

const POST_TYPE_GRADIENTS: Record<PostTypeId, string> = {
  1: 'from-purple-300 to-purple-800',
  2: 'from-red-300 to-red-800',
  3: 'from-emerald-300 to-emerald-800',
  4: 'from-blue-300 to-blue-800'
} as const;

export const PostHeader: FC<PostComponentProps & {
  onReport: () => void;
  isReportLoading?: boolean;
}> = ({ post, onReport, isReportLoading }) => {
  const displayUsername = post.username || post.user?.username || 'Anonymous';
  const gradientClass = POST_TYPE_GRADIENTS[post.post_type_id] || POST_TYPE_GRADIENTS[1];
  const avatarImg = post.user?.avatar_img;

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center space-x-3">
        <div className={`rounded-full bg-gradient-to-br ${gradientClass} p-0.5`}>
          <div className="bg-white p-0.5 rounded-full">
            <UserAvatar
              username={displayUsername}
              avatarImg={post.avatar_img || post.user?.avatar_img}
              size="md"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold">{displayUsername}</span>
            <span className="text-sm text-gray-500">
              ({post.user?.reputation_score || 0})
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {formatDate(post.created_at)}
            {post.updated_at && post.updated_at !== post.created_at && (
              <span> • Updated {formatDate(post.updated_at)}</span>
            )}
          </div>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={onReport}
            disabled={isReportLoading}
            className="text-red-600 cursor-pointer flex items-center"
          >
            <Flag className="w-4 h-4 mr-2" />
            <span>Report Post</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};