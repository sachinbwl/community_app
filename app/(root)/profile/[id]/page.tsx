import { fetchUser, fetchUserMentions } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { profileTabs } from "@/constants";
import Image from "next/image";
import ThreadsTab from "@/components/shared/ThreadsTab";
import CommunityCard from "@/components/cards/CommunityCard";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, PromiseLikeOfReactNode } from "react";
import Link from "next/link";


async function Page({ params }: { params: { id: string } }) {
    const user = await currentUser();
    if(!user) return null;

    const userInfo = await fetchUser(params.id);
    if(!userInfo?.onboarded) redirect('/onboarding');

    // Filter out duplicate communities
    const userCommunities = userInfo.communities
        ? userInfo.communities.filter((community: { id: any; }, index: any, self: any[]) =>
            index === self.findIndex(c => c.id === community.id)
        )
        : [];

    const mentions = await fetchUserMentions(userInfo._id);

    return (
        <section>
            <ProfileHeader 
                accountId={userInfo.id}
                authUserId={user.id}
                name={userInfo.name}
                username={userInfo.username}
                imgUrl={userInfo.image}
                bio={userInfo.bio}
            />

            <div className="mt-9">
                <Tabs defaultValue="threads" className="w-full">
                    <TabsList className="tab">
                        {profileTabs.map((tab) => (
                            <TabsTrigger key={tab.label} value={tab.value} className="tab">
                                <Image 
                                    src={tab.icon}
                                    alt={tab.label}
                                    width={24}
                                    height={24}
                                    className="object-contain"
                                />
                                <p className="max-sm:hidden">{tab.label}</p>
                                {tab.label === "Threads" && (
                                    <p className='ml-1 rounded-lg bg-green-200 px-2 py-1 !text-tiny-medium text-slate-900'>
                                        {userInfo?.threads?.length}
                                    </p>
                                    )}
                            </TabsTrigger>
                            
                        ))}
                    </TabsList>
                   
                    <TabsContent value='threads' className='w-full text-slate-900'>
                        {/* @ts-ignore */}
                        <ThreadsTab
                            currentUserId={user.id}
                            accountId={userInfo.id}
                            accountType='User'
                        />
                    </TabsContent>
                    <TabsContent value='communities' className="w-full text-slate-900">
                    <div>
                        {userCommunities.map((community: any, index: number) => (
                            <div key={community.id} className={`mb-${index !== userCommunities.length - 1 ? '4' : '0'}`}>
                            <CommunityCard
                                key={community.id}
                                id={community.id}
                                name={community.name}
                                username={community.username}
                                imgUrl={community.image}
                                bio={community.bio}
                                members={community.members}
                            />
                            </div>
                        ))}
                    </div>
                    </TabsContent>

                    <TabsContent value='tagged' className="w-full text-slate-900">
                    <div className='flex flex-col gap-4'>
                        {mentions.length > 0 ? (
                            <>
                                {mentions.reverse().map((mention: { _id: any; threadId: { _id: any; }; userId: { image: string | StaticImport; name: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; }; }, index: any) => (
                                    <Link key={mention._id} href={`/thread/${mention.threadId._id}`}>
                                        <div className="mention-item flex items-center gap-2 p-4 border rounded-lg transition duration-300 hover:bg-gray-100">
                                            <Image 
                                                src={mention.userId.image}
                                                alt='user_logo'
                                                width={24}
                                                height={24}
                                                className="rounded-full object-cover"
                                            />
                                            <p className='text-base'>
                                                <span className='text-primary-500'>{mention.userId.name}</span> mentioned user in a thread
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </>
                        ) : (
                            <p className='text-base'>No mentions yet</p>
                        )}
                    </div>
                    </TabsContent>
                  
                </Tabs>
            </div>
        </section>
    );
}

export default Page;