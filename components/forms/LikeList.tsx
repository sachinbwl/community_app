'use client'
// LikeList.tsx

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface LikeListProps {
  userIds: string[];
  names: string[];
  images: string[];
  likeCount: number;
  threadId: string;
}

const LikeList: React.FC<LikeListProps> = ({ userIds, names, images, likeCount, threadId }) => {
  const [showLikes, setShowLikes] = useState(false);
  // Determine the number of likes to display (maximum 5)
  const displayCount = Math.min(likeCount, 5);

  return (
    <div>
      <button onClick={() => setShowLikes(!showLikes)} className="text-subtle-medium text-gray-1">
        {likeCount} {likeCount === 1 ? "like" : "likes"}
      </button>
      {showLikes && (
        <div className="mt-2">
          <ul>
            {/* Iterate through the last `displayCount` likes */}
            {names.slice(0, displayCount).map((name, index) => (
              <li key={index} className="flex items-center py-1">
                <img src={images[index]} alt={name} width={12} height={12} className="rounded-full object-cover mr-2" />
                <Link href={`/profile/${userIds[index]}`}>
                  <span style={{ fontSize: "0.8rem"}} className="text-gray-800 font-light">{name}</span>
                </Link>
              </li>
            ))}
            {/* "View All" link */}
            <li className="py-1">
              <Link href={`/likes/${threadId}`} passHref>
                <span style={{ fontSize: "0.8rem"}} className="text-gray-600 font-light hover:text-gray-600 cursor-pointer">View All</span>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default LikeList;
