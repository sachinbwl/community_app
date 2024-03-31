import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";

import Comment from "@/components/forms/Comment";
import ThreadCard from "@/components/cards/ThreadCard";

import { fetchUser, fetchUserList } from "@/lib/actions/user.actions";
import { fetchThreadById } from "@/lib/actions/thread.action";
import ReplyCard from "@/components/cards/ReplyCard";

export const revalidate = 0;

const Page = async ({ params }: { params: { id: string } }) => {
  if (!params.id) return null;

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const thread = await fetchThreadById(params.id);
  const userList = await fetchUserList();

  return (
    <section className='relative'>
      <div>
        <ThreadCard
          key={thread._id}
          id={thread._id}
          currentUserId={user?.id || ""}
          parentId={thread.parentId}
          content={thread.text}
          author={thread.author}
          community={thread.community}
          createdAt={thread.createdAt}
          comments={thread.children}
          likes={thread.likes}
          commentId={JSON.stringify(userInfo._id)}
          commentImage={userInfo.image}
          userList={userList}
        />
      </div>

      <div className='mt-7'>
        <Comment
          threadId={thread.id}
          currentUserImg={userInfo.image} //correct tag is userInfo.image not user.imageUrl or vice versa
          currentUserId={JSON.stringify(userInfo._id)}
          userList={userList}
        />
      </div>

      <div className='mt-10'>
        {thread.children.map((childItem: any) => {
          return (
          <ReplyCard
            key={childItem._id}
            id={childItem._id}
            currentUserId={user?.id || ""} //or it can be user.id
            parentId={childItem.parentId}
            content={childItem.text}
            author={childItem.author}
            community={childItem.community}
            createdAt={childItem.createdAt}
            comments={childItem.children}
            likes={childItem.likes}
            isComment
            commentId={JSON.stringify(userInfo._id)}
            commentImage={userInfo.image}
          />
        )})}
      </div>
    </section>
  );
}

export default Page;