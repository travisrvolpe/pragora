// components/buttons/ViewPostButton.tsx
'use client'

import { useRouter } from 'next/navigation'
import { Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BaseButtonProps } from '@/types/buttons'
import { PostVariant } from '@/types/posts/component-types'

interface ViewPostButtonProps extends Omit<BaseButtonProps, 'onClick' | 'variant'> {
  postId: number
  variant?: PostVariant
}

export const ViewPostButton = ({
  postId,
  className,
  ...props
}: ViewPostButtonProps) => {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    router.push(`/post/${postId}`)
  }

  return (
    <Button
      {...props}
      icon={Eye}
      label="View"
      onClick={handleClick}
      variant="ghost"
      className={className}
    />
  )
}