import Link from "next/link";
import Image from "next/image";
import { formatDateString } from "@/lib/utils";
import DeleteThread from "../forms/DeleteThread";
import LikeButton from "@/components/LikeButton";
import LikeList from "../forms/LikeList";
import ReportIcon from "../forms/ReportPost";
import CommentIcon from "../forms/commentIcon";
import ViewReplies from "../forms/ViewReplies";


interface Props {
    id: string;
    currentUserId: string;
    parentId: string | null;
    content: string;
    author: {
      name: string;
      image: string;
      id: string;
    };
    community: {
      id: string;
      name: string;
      image: string;
    } | null;
    createdAt: string;
    comments: {
        _id: string;
        text: string;
        author: {
            name: string;
            image: string;
        };
    }[];
    likes: {
        id: string; // User ID
        name: string; // User's name
        image: string; // User's image URL
    }[];
    isComment?: boolean; // To check whether it is parent thread or comment
    commentId: string;
    commentImage: string
  }

const ReplyCard = ({
    id,
    currentUserId,
    parentId,
    content,
    author,
    community,
    createdAt,
    comments,
    likes,
    isComment,
    commentId,
    commentImage,
}: Props) => {
    const author_name = comments.map((comment) => (comment.author.name));
    const author_image = comments.map((comment) => (comment.author.image));
    const comments_text = comments.map((comment) => (comment.text));
    const comments_id = comments.map((comment) => (comment._id));
    
    return (
        <>
        <article className={`flex w-full flex-col rounded-xl ${isComment ? 'px-0 xs:px-7' : 'bg-white p-7 border border-green-800 shadow-lg'}`}>
            <div className="flex items-start justify-between">
                <div className="flex w-full flex-1 flex-row gap-4">
                    <div className="flex flex-col items-center">
                        <Link href={`/profile/${author.id}`} className="relative h-11 w-11">
                            <Image 
                                src={author.image}
                                alt="user_community_image"
                                fill
                                className="cursor-pointer rounded-full"
                            />
                        </Link>

                        <div className="thread-card_bar" />
                    </div>
                    <div className="flex w-full flex-col">
                        <Link href={`/profile/${author.id}`} className="w-fit">
                            <h4 className="cursor-pointer text-base-semibold text-dark-1">{author.name}</h4>
                        </Link>

                        <p className="mt-2 text-small-regular text-dark-2">{content}</p>
                        <div className={`${isComment && 'mb-10'} mt-5 flex flex-col gap-3`}>
                            <div className="flex gap-3.5">
                                <div>
                                    <LikeButton
                                        threadId={id.toString()}
                                        currentUserId={currentUserId.toString()}
                                        likes={likes?.map(user => user.id.toString())}
                                    />
                                </div>
                                <div>
                                    <CommentIcon
                                        threadId={id.toString()}
                                        currentUserId={commentId}
                                        currentUserImg={commentImage}
                                    />
                                </div>
                                
                                <div>
                                    <ReportIcon 
                                        threadId={id.toString()}
                                        currentUserId={currentUserId.toString()}
                                    />
                                </div>
                            </div>
                            <div>
                                {isComment && likes?.length > 0 && (
                                <div style={{ display: 'inline-block',marginRight: '10px' }}>
                                <LikeList
                                    userIds={likes?.map(user => user.id.toString())} 
                                    names={likes?.map(user => user.name)}
                                    images={likes?.map(user => user.image)}
                                    likeCount={likes.length}
                                    threadId={id.toString()}
                                />
                                </div>
                                )}
                                {isComment && comments.length > 0 && (
                                <div style={{ display: 'inline-block' }}>
                                    <ViewReplies 
                                        authorNames={author_name}
                                        authorImages={author_image}
                                        commentsText={comments_text} 
                                        commentsIds={JSON.stringify(comments_id)}
                                        commentsLength={comments.length}
                                    />
                                </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <DeleteThread
                    threadId={JSON.stringify(id)}
                    currentUserId={currentUserId}
                    authorId={author.id}
                    parentId={parentId}
                    isComment={isComment}
                />
            </div>

            <div className='ml-1 mt-3 flex items-center gap-4'> {/* Adjust gap as needed */}
                {!isComment && likes?.length > 0 && (
                    <>
                        {likes.slice(0, 2).map((like, index) => (
                            <Image
                                key={index}
                                src={like.image}
                                alt={`user_${index}`}
                                width={24}
                                height={24}
                                className={`${index !== 0 && "-ml-5"} rounded-full object-cover`}
                            />
                        ))}
                            <LikeList
                                userIds={likes?.map(user => user.id.toString())} 
                                names={likes?.map(user => user.name)}
                                images={likes?.map(user => user.image)}
                                likeCount={likes.length}
                                threadId={id.toString()}
                            />
                    </>
                )}
                {!isComment && comments.length > 0 && (
                    <>
                        {comments.slice(0, 2).map((comment, index) => (
                            <Image
                                key={index}
                                src={comment.author.image}
                                alt={`user_${index}`}
                                width={24}
                                height={24}
                                className={`${index !== 0 && "-ml-5"} rounded-full object-cover`}
                            />
                        ))}
                        <div>
                            <ViewReplies 
                                authorNames={author_name}
                                authorImages={author_image}
                                commentsText={comments_text} 
                                commentsIds={JSON.stringify(comments_id)}
                                commentsLength={comments.length}
                            />
                        </div>
                    </>
                )}
            </div>
            {!isComment && community && (
                <Link href={`/communities/${community.id}`} className="mt-5 flex items-center">
                    <p className="text-subtle-medium text-gray-1">
                        {formatDateString(createdAt)}
                        {community && ` - ${community.name} Community`}
                    </p>
                    <Image 
                        src={community.image}
                        alt={community.name}
                        width={14}
                        height={14}
                        className="ml-1 rounded-full object-cover"
                    />
                </Link>
            )}
        </article>

        </>
    );
}

export default ReplyCard;