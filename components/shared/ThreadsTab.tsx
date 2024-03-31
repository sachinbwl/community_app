import { fetchUser, fetchUserPosts } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import ThreadCard from "@/components/cards/ThreadCard";
import { fetchCommunityPosts } from "@/lib/actions/community.actions";


interface Result {
    name: string;
    image: string;
    id: string;
    threads: {
      _id: string;
      text: string;
      parentId: string | null;
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
      children: {
        author: {
          image: string;
        };
      }[];
      likes: {
        id: string; // User ID
        name: string; // User's name
        image: string; // User's image URL
    }[]; // Added likes array in Thread interface 
    }[];
    commentId: string;
    commentImage: string
  }

interface Props {
    currentUserId: string;
    accountId: string;
    accountType: string;
}

const ThreadsTab = async ({ currentUserId, accountId, accountType }: Props) => {
    let result: Result;

    const userInfo = await fetchUser(currentUserId);

    if(accountType === 'Community') {
        result = await fetchCommunityPosts(accountId);
    } else {
        result = await fetchUserPosts(accountId);
    }
    
    if(!result) { 
        redirect('/'); 
    }

    return (
        <section className="mt-9 flex flex-col gap-10">
            {result.threads.map((thread: any) =>( //Any can be removed or may be not
                <ThreadCard
                key={thread._id}
                id={thread._id}
                currentUserId={currentUserId}
                parentId={thread.parentId}
                content={thread.text}
                author={
                    accountType === 'User'
                    ? { name: result.name, image: result.image, id: result.id }
                    : { name: thread.author.name, image: thread.author.image, id: thread.author.id }
                }
                community={
                    accountType === "Community"
                    ? { name: result.name, id: result.id, image: result.image }
                    : thread.community 
                }
                createdAt={thread.createdAt}
                comments={thread.children}
                likes={thread.likes}
                commentId={JSON.stringify(userInfo._id)}
                commentImage={userInfo.image}
              />
            ))}
        </section>
    );
}

export default ThreadsTab;