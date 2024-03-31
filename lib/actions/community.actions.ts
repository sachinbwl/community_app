"use server";

import mongoose, { FilterQuery, SortOrder } from "mongoose";

import Community from "../models/community.model";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { revalidatePath } from "next/cache";


export async function createCommunity(
  id: string,
  name: string,
  username: string,
  image: string,
  bio: string,
  createdById: string // Change the parameter name to reflect it's an id
) {
  try {
    connectToDB();

    // Find the user with the provided unique id
    const user = await User.findOne({ id: createdById });

    if (!user) {
      throw new Error("User not found"); // Handle the case if the user with the id is not found
    }

    const newCommunity = new Community({
      id,
      name,
      username,
      image,
      bio,
      createdBy: user._id, // Use the mongoose ID of the user
    });

    const createdCommunity = await newCommunity.save();

    // Update User model
    user.communities.push(createdCommunity._id);
    await user.save();

    return createdCommunity;
  } catch (error) {
    // Handle any errors
    console.error("Error creating community:", error);
    throw error;
  }
}

export async function fetchCommunityDetails(id: string) {
  try {
    connectToDB();

    const communityDetails = await Community.findOne({ id }).populate([
      "createdBy",
      {
        path: "members",
        model: User,
        select: "name username image _id id",
      },
      {
        path: "membershipRequests.user",
        model: User,
        select: "name username image _id id",
      }
    ]);

    return communityDetails;
  } catch (error) {
    // Handle any errors
    console.error("Error fetching community details:", error);
    throw error;
  }
}

export async function fetchCommunityPosts(id: string) {
  try {
    connectToDB();

    const communityPosts = await Community.findById(id).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "author",
          model: User,
          select: "name image id", // Select the "name" and "_id" fields from the "User" model
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "image _id", // Select the "name" and "_id" fields from the "User" model
          },
        },
        {
          path: "likes",
          model: User,
          select: "id name image", // Select the "name" and "_id" fields from the "User" model
        },
      ],
    });

    return communityPosts;
  } catch (error) {
    // Handle any errors
    console.error("Error fetching community posts:", error);
    throw error;
  }
}

export async function fetchCommunities({
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    // Calculate the number of communities to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, "i");

    // Create an initial query object to filter communities.
    const query: FilterQuery<typeof Community> = {};

    // If the search string is not empty, add the $or operator to match either username or name fields.
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    // Define the sort options for the fetched communities based on createdAt field and provided sort order.
    const sortOptions = { createdAt: sortBy };

    // Create a query to fetch the communities based on the search and sort criteria.
    const communitiesQuery = Community.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize)
      .populate("members");

    // Count the total number of communities that match the search criteria (without pagination).
    const totalCommunitiesCount = await Community.countDocuments(query);

    const communities = await communitiesQuery.exec();

    // Check if there are more communities beyond the current page.
    const isNext = totalCommunitiesCount > skipAmount + communities.length;

    return { communities, isNext };
  } catch (error) {
    console.error("Error fetching communities:", error);
    throw error;
  }
}

export async function addMemberToCommunity(
  communityId: string,
  memberId: string
) {
  try {
    connectToDB();

    // Find the community by its unique id
    const community = await Community.findOne({ id: communityId });

    if (!community) {
      throw new Error("Community not found");
    }

    // Find the user by their unique id
    const user = await User.findOne({ id: memberId });

    if (!user) {
      throw new Error("User not found");
    }

    // Check if the user is already a member of the community
    if (community.members.includes(user._id)) {
      throw new Error("User is already a member of the community");
    }

    // Add the user's _id to the members array in the community
    community.members.push(user._id);
    await community.save();

    // Add the community's _id to the communities array in the user
    user.communities.push(community._id);
    await user.save();

    return community;
  } catch (error) {
    // Handle any errors
    console.error("Error adding member to community:", error);
    throw error;
  }
}

export async function removeUserFromCommunity(
  userId: string,
  communityId: string
) {
  try {
    connectToDB();

    const userIdObject = await User.findOne({ id: userId }, { _id: 1 });
    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    if (!userIdObject) {
      throw new Error("User not found");
    }

    if (!communityIdObject) {
      throw new Error("Community not found");
    }

    // Remove the user's _id from the members array in the community
    await Community.updateOne(
      { _id: communityIdObject._id },
      { $pull: { members: userIdObject._id } }
    );

    // Remove the community's _id from the communities array in the user
    await User.updateOne(
      { _id: userIdObject._id },
      { $pull: { communities: communityIdObject._id } }
    );

    return { success: true };
  } catch (error) {
    // Handle any errors
    console.error("Error removing user from community:", error);
    throw error;
  }
}

interface Params {
  communityId: string;
  name: string;
  username: string;
  image: string;
  bio: string,
}
export async function updateCommunityInfo({
  communityId,
  name,
  username,
  image,
  bio,
}: Params): Promise<void> {
  try {
    connectToDB();

    // Find the community by its _id and update the information
    const updatedCommunity = await Community.findOneAndUpdate(
      { id: communityId },
      { name, username, image, bio }, 
      { upsert: true } // To return the updated document
    );

    if (!updatedCommunity) {
      throw new Error("Community not found");
    }
    // Revalidate the community data for the specific path
    revalidatePath(`/communities/${communityId}`);
    
  } catch (error) {
    // Handle any errors
    console.error("Error updating community information:", error);
    throw error;
  }
}

export async function deleteCommunity(communityId: string) {
  try {
    connectToDB();

    // Find the community by its ID and delete it
    const deletedCommunity = await Community.findOneAndDelete({
      id: communityId,
    });

    if (!deletedCommunity) {
      throw new Error("Community not found");
    }

    // Delete all threads associated with the community
    await Thread.deleteMany({ community: communityId });

    // Find all users who are part of the community
    const communityUsers = await User.find({ communities: communityId });

    // Remove the community from the 'communities' array for each user
    const updateUserPromises = communityUsers.map((user) => {
      user.communities.pull(communityId);
      return user.save();
    });

    await Promise.all(updateUserPromises);

    return deletedCommunity;
  } catch (error) {
    console.error("Error deleting community: ", error);
    throw error;
  }
}


export async function requestMembership(userId: string, communityId: string, userEmail: string) {
  try {
    connectToDB();

    // Remove additional characters like inverted commas
    const cleanUserId = userId.replace(/["']/g, "");
    const cleanCommunityId = communityId.replace(/["']/g, "");
    const cleanuserEmail = userEmail.replace(/["']/g, "");

    // Find the user by their id
    const user = await User.findOne({ id: cleanUserId });

    if (!user) {
      throw new Error("User not found");
    }

    // Find the community by its id
    const community = await Community.findOne({ id: cleanCommunityId });

    if (!community) {
      throw new Error("Community not found");
    }

    console.log("Community:", community);

        // Check if the user is already a member of the community
    if (community.members && community.members.some((member: { toString: () => any; }) => member.toString() === user._id.toString())) {
      throw new Error("User is already a member of the community");
    }

    // Check if the user has already requested membership
    if (community.membershipRequests && community.membershipRequests.some((request: { user: { toString: () => any; }; }) => request.user.toString() === user._id.toString())) {
      throw new Error("User has already requested membership");
    }

    // Add the user's id to the membership requests array in the community
    community.membershipRequests.push({ user: user._id, email: cleanuserEmail });
    await community.save();

    return { message: "Membership request sent successfully" };
  } catch (error) {
    console.error("Error requesting membership:", error);
    throw error;
  }
}

export async function deleteMembershipRequest(userId: string, communityId: string) {
  try {
    connectToDB();

    // Remove additional characters like inverted commas
    const cleanUserId = userId.replace(/["']/g, "");
    const cleanCommunityId = communityId.replace(/["']/g, "");

    // Find the user by their id
    const user = await User.findOne({ id: cleanUserId });

    if (!user) {
      throw new Error("User not found");
    }

    // Find the community by its id
    const community = await Community.findOne({ id: cleanCommunityId });

    if (!community) {
      throw new Error("Community not found");
    }

    // Check if the user's request exists in the membership requests of the community
    // Find the index of the user's request in the membership requests array
    const index = community.membershipRequests.findIndex((request: { user: { toString: () => any; }; }) => request.user.toString() === user._id.toString());
    if (index === -1) {
      throw new Error("User's membership request not found");
    }

    // Remove the user's id from the membership requests array in the community
    community.membershipRequests.splice(index, 1);
    await community.save();

    return { message: "Membership request canceled successfully" };
  } catch (error) {
    console.error("Error canceling membership request:", error);
    throw error;
  }
}
