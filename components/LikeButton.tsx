"use client"

import Image from "next/image";
import { useState } from "react";
import { likeThread } from "@/lib/actions/thread.action";


interface Props {
  threadId: string;
  currentUserId: string;
  likes: string[];
}

const LikeButton = ({ threadId, currentUserId, likes }: Props) => {
  const [isLiked, setIsLiked] = useState(likes?.includes(currentUserId));

  const handleLikeClick = async () => {
    try {
      const action = isLiked ? "unlike" : "like";
      await likeThread(threadId, currentUserId, `/thread/${threadId}`); // Use the correct path for revalidation
      setIsLiked(!isLiked);
      console.log(`Thread ${threadId} ${action}d successfully.`); // Log the action
    } catch (error: any) {
      console.error("Failed to perform like/unlike action:", error.message);
    }
  };

  return (
    <Image
      src={isLiked ? "/assets/heart.svg" : "/assets/heart-gray.svg"}
      alt="heart"
      width={19}
      height={19}
      className="cursor-pointer object-contain"
      onClick={handleLikeClick} // Attach onClick event handler
    />
    
  );
};

export default LikeButton;
