'use client'

import React, { useState } from "react";
import Image from "next/image";
import CommentForm from "./Comment"; // Assuming the existing comment form is in a separate file


interface CommentProps {
    threadId: string;
    currentUserId: string;
    currentUserImg: string;
    userList: {id:string; display: string;}[];
}

const CommentIcon = ({ threadId, currentUserId, currentUserImg, userList }: CommentProps) => {
    const [showForm, setShowForm] = useState(false);

    const toggleFormVisibility = () => {
        setShowForm(!showForm);
    };

    return (
        <div>
            <div onClick={toggleFormVisibility} className="cursor-pointer">
                <Image src="/assets/reply.svg" alt="reply" width={19} height={19} className="cursor-pointer object-contain" />
            </div>
            {showForm && (
                <div className="comment-form-container">
                    <CommentForm threadId={threadId} currentUserImg={currentUserImg} currentUserId={currentUserId} toggleFormVisibility={toggleFormVisibility} userList={userList}/>
                </div>
            )}
        </div>
    );
};



export default CommentIcon;
