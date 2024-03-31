import Image from "next/image";
import Link from "next/link";
import SendRequest from "../forms/SendRequest";


interface Props {
    accountId: string;
    authUserId: string;
    name: string;
    username: string;
    imgUrl: string;
    bio: string;
    type?: 'User' | 'Community';
    CommunityId?: string;
    isUserRequested?: boolean;
    requestEmail?: string;
};

const ProfileHeader = ({
    accountId, authUserId, name, username, imgUrl, bio, type, CommunityId ='', isUserRequested=false, requestEmail=''
    }: Props) => {
        const comId = CommunityId.replace(/["']/g, "");
    return (
        <div className="flex w-full flex-col justify-start">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative h-20 w-20 object-cover">
                        <Image 
                            src={imgUrl}
                            alt="Profile Image"
                            fill
                            className="rounded-full object-cover shadow-2xl"
                        />
                    </div>

                    <div className="flex-1">
                        <h2 className="text-left text-heading3-bold text-slate-900">
                            {name}
                        </h2>
                        <p className="text-base-medium text-gray-1">
                            @{username}
                        </p>
                    </div>
                </div>
                {accountId === authUserId && type !== "Community" && (
                    <Link href='/profile/edit'>
                        <div className='flex cursor-pointer gap-3 rounded-lg bg-white px-4 py-2'>
                            <Image
                                src='/assets/edit.svg'
                                alt='edit'
                                width={16}
                                height={16}
                            />

                            <p className='text-slate-900 max-sm:hidden'>Edit</p>
                        </div>
                    </Link>
                    )}
                {accountId == authUserId && type =="Community" &&(
                    <Link href={`/communities/edit/${comId}`}>
                        <div className="flex cursor-pointer gap-3 rounded-lg bg-white px-4 py-2">
                        <Image
                            src='/assets/edit.svg'
                            alt='edit'
                            width={16}
                            height={16}
                        />

                        <p className='text-slate-900 max-sm:hidden'>Edit</p>
                        </div>
                    </Link>
                )}
                {accountId !== authUserId && type !=="User" &&(
                    <SendRequest 
                        UserId={JSON.stringify(authUserId)}
                        CommunityId={CommunityId}
                        authorId={JSON.stringify(accountId)}
                        isUserRequested={isUserRequested}
                        requestEmail={requestEmail}
                    />
                )}
            </div>
            <p className="mt-6 max-w-lg text-base-regular text-slate-900">
                {bio}
            </p>
            <div className="mt-12 h-0.5 w-full bg-dark-3" />
        </div>
    );
}

export default ProfileHeader;