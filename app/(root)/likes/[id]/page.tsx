import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";
import { fetchUser } from "@/lib/actions/user.actions";
import { getThreadLikes } from "@/lib/actions/thread.action";
import Link from "next/link";


export const revalidate = 0;

const Page = async ({ params }: { params: { id: string } }) => {
  if (!params.id) return null;

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const likes = await getThreadLikes(params.id);

  return (
      <section className='relative'>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-gray-800 text-lg font-semibold mb-4">Likers:</h2>
          <ul className="divide-y divide-gray-200">
            {likes?.reverse().map((liker: any, index: any) => (
              <li key={index} className="flex items-center py-2">
                <img src={liker.image} alt={liker.name} width={36} height={36} className="rounded-full object-cover mr-3" />
                <Link href={`/profile/${liker.id}`}>
                <span className="text-gray-800 text-base">{liker.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
  );
};

export default Page;