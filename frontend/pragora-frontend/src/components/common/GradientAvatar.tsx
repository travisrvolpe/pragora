import { cn } from '@/applib/utils/utils';
import { UserAvatar } from '@/components/user/UserAvatar';
import { PostTypeId } from '@/types/posts/post-types';

const POST_TYPE_GRADIENTS: Record<PostTypeId, string> = {
  1: 'from-purple-300 to-purple-800', // Thought
  2: 'from-red-300 to-red-800',      // Image
  3: 'from-emerald-300 to-emerald-800', // Article
  4: 'from-blue-300 to-blue-800'     // Video
} as const;

interface GradientAvatarProps {
  username: string;
  avatarImg?: string;
  postType: PostTypeId;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GradientAvatar: React.FC<GradientAvatarProps> = ({
  username,
  avatarImg,
  postType,
  size = 'md',
  className
}) => {
  const gradientClass = POST_TYPE_GRADIENTS[postType] || POST_TYPE_GRADIENTS[1];

  return (
    <div className={cn(
      'rounded-full bg-gradient-to-br p-0.5',
      gradientClass,
      className
    )}>
      <div className="bg-white p-0.5 rounded-full">
        <UserAvatar
          username={username}
          avatarImg={avatarImg}
          size={size}
        />
      </div>
    </div>
  );
};

export default GradientAvatar;