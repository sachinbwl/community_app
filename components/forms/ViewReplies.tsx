'use client'

import React, { useState } from 'react';

interface Props {
    authorNames: string[];
    authorImages: string[];
    commentsText: string[];
    commentsIds: string;
    commentsLength: number; // Keeping commentsLength as a number
}

const ViewReplies: React.FC<Props> = ({
    authorNames,
    authorImages,
    commentsText,
    commentsIds,
    commentsLength,
}) => {
    const [showReplies, setShowReplies] = useState(false);

    const toggleRepliesVisibility = () => {
        setShowReplies(!showReplies);
    };

    return (
        <div>
            {/* Handle click to toggle replies visibility */}
            <p
                onClick={toggleRepliesVisibility}
                className="mt-1 text-subtle-medium text-gray-1 cursor-pointer"
            >
                {commentsLength} repl{commentsLength !== 1 ? 'ies' : 'y'} {/* Adjusting based on commentsLength */}
            </p>
            {/* Show replies in a scrollable box */}
            {showReplies && (
                <div className="mt-3 p-3 border border-gray-200 rounded-md max-h-40 overflow-y-auto">
                    {commentsText.map((text, index) => (
                        <div key={commentsIds[index]} className="mb-3">
                            {/* Author name and image */}
                            <div className="flex items-center mb-1">
                                <img
                                    src={authorImages[index]}
                                    alt={authorNames[index]}
                                    className="w-6 h-6 rounded-full mr-2"
                                />
                                <p className="text-sm font-medium">{authorNames[index]}</p>
                            </div>
                            {/* Comment text */}
                            <p className="text-sm text-gray-700 ml-8">{text}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ViewReplies;
