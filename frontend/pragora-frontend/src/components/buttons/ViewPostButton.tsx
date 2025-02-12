import { useRouter } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/utils';
import { BaseButtonProps } from '@/types/buttons';
import { PostVariant } from '@/types/posts/post-types';

interface ViewPostButtonProps extends Omit<BaseButtonProps, 'onClick' | 'variant'> {
  postId: number;
  variant?: PostVariant;
}

export const ViewPostButton = ({
  postId,
  className,
  ...props
}: ViewPostButtonProps) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    router.push(`/dialectica/${postId}`);
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      variant="outline"
      className={cn(
        "flex items-center gap-2 hover:bg-gray-100 transition-colors",
        "text-gray-700 hover:text-gray-900",
        className
      )}
    >
      <span>View Post</span>
      <ArrowUpRight className="w-4 h-4" />
    </Button>
  );
};