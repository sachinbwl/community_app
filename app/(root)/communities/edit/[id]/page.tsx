import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { fetchCommunityDetails } from "@/lib/actions/community.actions";
import CommunityProfile from "@/components/forms/CommunityProfile";


async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) return null;

  const communityDetails = await fetchCommunityDetails(params.id);

  const communityData = {
    communityId: communityDetails.id,
    name: communityDetails.name,
    username: communityDetails.username,
    image: communityDetails.image,
    bio: communityDetails.bio,
  };

  // Check if the current user is authorized to edit the community
  const isAuthorized = user.id === communityDetails.createdBy.id;

  return (
    <>
      <h1 className='head-text'>Edit Community</h1>
      <p className='mt-3 text-base-regular text-slate-900'>Make any changes</p>

      <section className='mt-12'>
      {isAuthorized ? (
          <CommunityProfile community={communityData} btnTitle='Continue'/>
        ) : (
          <div>
            <p>You are not authorized to edit this community.</p>
            {/* You can add additional messages or actions here */}
          </div>
        )}
      </section>
    </>
  );
}

export default Page;