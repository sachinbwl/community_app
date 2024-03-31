import Image from "next/image";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { fetchUser, fetchUserMentions, getActivity, getActivityLikes } from "@/lib/actions/user.actions";

async function Page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const activity = await getActivity(userInfo._id);
  const likes = await getActivityLikes(userInfo._id);
  const mentions = await fetchUserMentions(userInfo._id);

  return (
    <>
      <h1 className='head-text'>Activity</h1>
      <div className="activity-box-container">
        <div className="activity-box">
          <h2 className="box-title">Replies:</h2>
          <div className="box-content scrolling-section">
            <div className='flex flex-col gap-0'>
            {activity.length > 0 ? (
              <>
                {activity.map((activity) => (
                  <Link key={activity._id} href={`/thread/${activity.parentId}`}>
                    <article className='activity-card'>
                      <Image
                        src={activity.author.image}
                        alt='user_logo'
                        width={20}
                        height={20}
                        className='rounded-full object-cover'
                      />
                      <p className='!text-small-regular text-slate-900'>
                        <span className='mr-1 text-primary-500'>
                          {activity.author.name}
                        </span>{" "}
                        replied to your thread
                      </p>
                    </article>
                  </Link>
                ))}
              </>
            ) : (
              <p className='!text-base-regular text-slate-900'>No activity yet</p>
            )}
            </div>
          </div>
        </div>

        <div className="activity-box">
          <h2 className="box-title">Likes:</h2>
          <div className="box-content scrolling-section">
            <div className='flex flex-col gap-0'>
            {likes.length > 0 ? (
              <>
                {likes.map((like) => (
                  <Link key={like.threadId} href={`/likes/${like.threadId}`}>
                    <article className="activity-card">
                      <Image 
                        src={like.image}
                        alt='user_logo'
                        width={20}
                        height={20}
                        className="rounded-full object-cover"
                      />
                      <p className='!text-small-regular text-slate-900'>
                        <span className='mr-1 text-primary-500'>
                          {like.name}
                        </span>{" "}
                        liked your {like.type === 'thread' ? 'post' : 'reply'}
                      </p>
                    </article>
                  </Link>
                ))}
              </>
            ) : (
              <p className='!text-base-regular text-slate-900'>No likes yet</p>
            )}
            </div>
          </div>
        </div>
        <div className="activity-box">
          <h2 className="box-title">Mentions:</h2>
          <div className="box-content scrolling-section">
            <div className='flex flex-col gap-0'>
              {mentions.length > 0 ? (
                <>
                  {mentions.reverse().map((mention: any) => (
                    <Link key={mention._id} href={`/thread/${mention.threadId._id}`}>
                      <article className="activity-card">
                        <Image 
                          src={mention.userId.image}
                          alt='user_logo'
                          width={20}
                          height={20}
                          className="rounded-full object-cover"
                        />
                        <p className='!text-small-regular text-slate-900'>
                          <span className='mr-1 text-primary-500'>
                            {mention.userId.name}
                          </span>{" "}
                          mentioned you in a thread
                        </p>
                      </article>
                    </Link>
                  ))}
                </>
              ) : (
                <p className='!text-base-regular text-slate-900'>No mentions yet</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default Page;