import React from "react";
import Button from "../ui/Button";
import '../../styles/components/NetworkButtons.css';


export const AcceptRequestButton = ({ onClick }) => (
    <Button
        label="Accept"
        className="accept-button"
        onClick={onClick}
        tooltip="Accept friend request"
    />
);

export const IgnoreRequestButton = ({ onClick }) => (
    <Button
        label="Ignore"
        className="ignore-button"
        onClick={onClick}
        tooltip="Ignore friend request"
    />
);

export const MakeRequestButton = ({ onClick }) => (
    <Button
        label="Add Friend"
        className="request-button"
        onClick={onClick}
        tooltip="Send friend request"
    />
);

export const SendMessageButton = ({ onClick }) => (
    <Button
        label="Send Message"
        className="message-button"
        onClick={onClick}
        tooltip="Send a message"
    />
);
