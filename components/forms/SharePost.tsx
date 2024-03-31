'use client'

import React, { useState } from "react";
import Image from "next/image";
import { 
  FacebookShareButton, FacebookIcon,
  EmailShareButton, EmailIcon,
  LinkedinShareButton, LinkedinIcon,
  TelegramShareButton, TelegramIcon,
  TwitterShareButton, TwitterIcon,
  WhatsappShareButton, WhatsappIcon 
} from "react-share";


interface SharePostProps {
  content: string;
  authorName: string;
  authorId: string;
  threadId: string;
}

const SharePost: React.FC<SharePostProps> = ({ content, authorName, authorId, threadId }) => {
  const shareUrl = `www.banyanbond.com/thread/${threadId}`;

  // Function to extract first line or 100 characters of content as title
  const getTitle = (content: string) => {
    const firstLine = content.split("\n")[0]; // Get the first line
    return firstLine.length > 100 ? firstLine.substring(0, 100) + "..." : firstLine;
  };
  const title = getTitle(content); //Add first line of content here

  const authorProfileUrl = `www.banyanbond.com/profile/${authorId}`;
  const body = `${content} - ${authorName} on BanyanBond. Check out ${authorName}'s profile: ${authorProfileUrl}`;

  const [showIcons, setShowIcons] = useState(false);

  const handleShareClick = () => {
    setShowIcons(!showIcons);
  };

  return (
    <div>
      <Image
        src="/assets/share.svg"
        alt="share"
        width={19}
        height={19}
        className="cursor-pointer object-contain"
        onClick={handleShareClick}
      />
      {showIcons && (
        <div className="flex gap-2 mt-2">
          <FacebookShareButton url={shareUrl}>
            <FacebookIcon size={32} round />
          </FacebookShareButton>

          <TwitterShareButton url={shareUrl} title={title}>
            <TwitterIcon size={32} round />
          </TwitterShareButton>

          <LinkedinShareButton url={shareUrl} title={title} summary={body} source="BanyanBond">
            <LinkedinIcon size={32} round />
          </LinkedinShareButton>

          <TelegramShareButton url={shareUrl}>
            <TelegramIcon size={32} round />
          </TelegramShareButton>

          <WhatsappShareButton url={shareUrl} title={title}>
            <WhatsappIcon size={32} round />
          </WhatsappShareButton>

          <EmailShareButton url={shareUrl} subject={title} body={body}>
            <EmailIcon size={32} round />
          </EmailShareButton>
        </div>
      )}
      
    </div>
  );
};

export default SharePost;
