import Image from "next/image";
import { currentUser } from "@clerk/nextjs";

import { communityTabs } from "@/constants";

import UserCard from "@/components/cards/UserCard";
import ThreadsTab from "@/components/shared/ThreadsTab";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deleteMembershipRequest, fetchCommunityDetails } from "@/lib/actions/community.actions";


async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return null;

  const communityDetails = await fetchCommunityDetails(params.id);
  const isUserRequested = communityDetails.membershipRequests.some((request:any) => request.user.id === user.id);
  const isUserAdmin = user.id === communityDetails.createdBy.id;
  const requestemail = user.emailAddresses[0]?.emailAddress;

    // Get an array of user IDs of members
  const memberIds = communityDetails.members.map((member: { id: any; }) => member.id);

  // Filter out membership requests whose user IDs are also in the members array
  const requestsToDelete = communityDetails.membershipRequests.filter((request: { user: { id: any; }; }) => memberIds.includes(request.user.id));

  // Delete each membership request
  for (const request of requestsToDelete) {
    await deleteMembershipRequest(request.user.id, communityDetails.id);
  }

  return (
    <section>
      <ProfileHeader
        accountId={communityDetails.createdBy.id}
        authUserId={user.id}
        name={communityDetails.name}
        username={communityDetails.username}
        imgUrl={communityDetails.image}
        bio={communityDetails.bio}
        isUserRequested={isUserRequested}
        CommunityId={JSON.stringify(communityDetails.id)}
        requestEmail={JSON.stringify(requestemail)}
        type="Community"
      />

      <div className='mt-9'>
        <Tabs defaultValue='threads' className='w-full'>
          <TabsList className='tab'>
            {communityTabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.value} className='tab'>
                <Image
                  src={tab.icon}
                  alt={tab.label}
                  width={24}
                  height={24}
                  className='object-contain'
                />
                <p className='max-sm:hidden'>{tab.label}</p>

                {tab.label === "Threads" && (
                  <p className='ml-1 rounded-lg bg-green-200 px-2 py-1 !text-tiny-medium text-slate-900'>
                    {communityDetails.threads.length}
                  </p>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value='threads' className='w-full text-light-1'>
            {/* @ts-ignore */}
            <ThreadsTab
              currentUserId={user.id}
              accountId={communityDetails._id}
              accountType='Community'
            />
          </TabsContent>

          <TabsContent value='members' className='mt-9 w-full text-slate-900'>
            <section className='mt-9 flex flex-col gap-10'>
              {communityDetails.members.map((member: any) => (
                <UserCard
                  key={member.id}
                  id={member.id}
                  name={member.name}
                  username={member.username}
                  imgUrl={member.image}
                  personType='User'
                />
              ))}
            </section>
          </TabsContent>

          <TabsContent value='requests' className='w-full text-slate-900'>
          <section className="mt-9 flex flex-col gap-10">
              {communityDetails.membershipRequests.length === 0 ? (
                <p>No membership requests</p>
              ) : (
                communityDetails.membershipRequests.map((request: any) => (
                    <UserCard
                      key={request.user.id}
                      id={request.user.id}
                      name={request.user.name}
                      username={request.user.username}
                      imgUrl={request.user.image}
                      personType="User"
                      isUserAdmin={isUserAdmin}
                      requestEmail={request.email}
                    />
                ))
              )}
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

export default Page;