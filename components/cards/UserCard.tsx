"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useState } from "react";


interface Props {
  id: string;
  name: string;
  username: string;
  imgUrl: string;
  personType: string;
  isUserAdmin?: boolean;
  requestEmail?: string;
}

function UserCard({ id, name, username, imgUrl, personType, isUserAdmin =false, requestEmail='' }: Props) {
  const router = useRouter();
  const isCommunity = personType === "Community";
  
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(requestEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    } catch (error) {
      console.error('Failed to copy email:', error);
    }
  };

  return (
    <article className='user-card'>
      <div className='user-card_avatar'>
        <div className='relative h-12 w-12'>
          <Image
            src={imgUrl}
            alt='user_logo'
            fill
            className='rounded-full object-cover'
          />
        </div>

        <div className='flex-1 text-ellipsis'>
          <h4 className='text-base-semibold text-slate-900'>{name}</h4>
          <p className='text-small-medium text-gray-1'>@{username}</p>
        </div>
      </div>

      {isUserAdmin &&(
        <Button className="user-card_btn" onClick={handleCopyEmail}>
          {copied ? 'Copied!' : 'Copy Email'}
        </Button>
      )}
      <Button
        className='user-card_btn'
        onClick={() => {
          if (isCommunity) {
            router.push(`/communities/${id}`);
          } else {
            router.push(`/profile/${id}`);
          }
        }}
      >
        View
      </Button>
    </article>
  );
}

export default UserCard;