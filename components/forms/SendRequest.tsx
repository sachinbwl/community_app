"use client";

import { useRouter } from "next/navigation";
import { deleteMembershipRequest, requestMembership } from "@/lib/actions/community.actions";

interface Props {
    UserId: string;
    CommunityId: string;
    authorId: string;
    isUserRequested: boolean;
    requestEmail: string;
}

function SendRequest({
  UserId, CommunityId, authorId, isUserRequested, requestEmail
}: Props) {
  const router = useRouter();

  if (UserId === authorId) return null;

  const handleSendRequest = async () => {
      try {
          await requestMembership(UserId, CommunityId, requestEmail);
          setTimeout(() => {
            router.refresh(); // Reload the page after 2 seconds delay
        }, 1000);
      } catch (error) {
          console.error("Error sending request:", error);
      }
  };

  const handleCancelRequest = async () => {
      try {
          await deleteMembershipRequest(UserId, CommunityId);
          setTimeout(() => {
            router.refresh(); // Reload the page after 2 seconds delay
        }, 1000);
      } catch (error) {
          console.error("Error cancelling request:", error);
      }
  };

  return (
      <div>
          {isUserRequested ? (
              <div>
                  <button onClick={handleCancelRequest} className="close-button">Cancel Request</button>
              </div>
          ) : (
              <button onClick={handleSendRequest} className="close-button">Request Invite</button>
          )}
      </div>
  );
}

export default SendRequest;