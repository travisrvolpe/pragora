// src/components/buttons/NetworkButtons.tsx
import React from 'react';
import Button from '../ui/button';
import { NetworkButtonProps } from '../../types/buttons';

export const AcceptRequestButton: React.FC<Omit<NetworkButtonProps, 'networkAction'>> = ({
  onClick,
  userId,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) onClick(e);
  };

  return (
    <Button
      {...props}
      label="Accept"
      className="accept-button"
      onClick={handleClick}
      tooltip="Accept friend request"
      type="button"
    />
  );
};

export const IgnoreRequestButton: React.FC<Omit<NetworkButtonProps, 'networkAction'>> = ({
  onClick,
  userId,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) onClick(e);
  };

  return (
    <Button
      {...props}
      label="Ignore"
      className="ignore-button"
      onClick={handleClick}
      tooltip="Ignore friend request"
      type="button"
    />
  );
};

export const MakeRequestButton: React.FC<Omit<NetworkButtonProps, 'networkAction'>> = ({
  onClick,
  userId,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) onClick(e);
  };

  return (
    <Button
      {...props}
      label="Add Friend"
      className="request-button"
      onClick={handleClick}
      tooltip="Send friend request"
      type="button"
    />
  );
};

export const SendMessageButton: React.FC<Omit<NetworkButtonProps, 'networkAction'>> = ({
  onClick,
  userId,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) onClick(e);
  };

  return (
    <Button
      {...props}
      label="Send Message"
      className="message-button"
      onClick={handleClick}
      tooltip="Send a message"
      type="button"
    />
  );
};