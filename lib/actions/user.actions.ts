"use server"

import { FilterQuery, SortOrder } from "mongoose";
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model"
import { connectToDB } from "../mongoose";
import Community from "../models/community.model";
import { getLikes } from "./thread.action";
import mongoose from 'mongoose';



export async function fetchUser(userId: string) {
    try {
        connectToDB();

        return await User.findOne({ id: userId }).populate({
           path: 'communities',
           model: Community,
           populate: {
            path: 'members',
            model: 'User',
            select: 'image'
           }
        });
    } catch (error: any) {
        throw new Error(`Failed to fetch user: ${error.message}`);
    }
}

interface Params {
    userId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
    path: string;
}

export async function updateUser({
    userId,
    username,
    name,
    bio,
    image,
    path,
}: Params): Promise<void> {
    connectToDB();

    try {
        await User.findOneAndUpdate(
            { id: userId},
            { 
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded: true,
            },
            { upsert: true }
            );
    
            if (path === "/profile/edit") {
                revalidatePath(path);
              }
    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`);
    }
}

export async function fetchUserPosts(userId: string) {
    try {
      connectToDB();
  
      // Find all threads authored by the user with the given userId
      const threads = await User.findOne({ id: userId }).populate({
        path: "threads",
        model: Thread,
        populate: [
          {
            path: "community",
            model: Community,
            select: "name id image _id", // Select the "name" and "_id" fields from the "Community" model
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "name image id", // Select the "name" and "_id" fields from the "User" model
            },
          },
          {
            path: "likes",
            model: User,
            select: "id name image", // Select the "name" and "_id" fields from the "User" model
          },
        ],
      });
      return threads;
    } catch (error) {
      console.error("Error fetching user threads:", error);
      throw error;
    }
  }

export async function fetchUsers({
    userId,
    searchString = "",
    pageNumber = 1,
    pageSize = 20,
    sortBy = "desc",
    }: {
    userId: string;
    searchString?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder;
}) {
    try {
        connectToDB();

        // Calculate the number of users to skip based on the page number and page size.
        const skipAmount = (pageNumber - 1) * pageSize;

        // Create a case-insensitive regular expression for the provided search string.
        const regex = new RegExp(searchString, "i");

        // Create an initial query object to filter users.
        const query: FilterQuery<typeof User> = {
            id: { $ne: userId }, // Exclude the current user from the results.
        };

        // If the search string is not empty, add the $or operator to match either username or name fields.
        if (searchString.trim() !== "") {
        query.$or = [
            { username: { $regex: regex } },
            { name: { $regex: regex } },
        ];
        }

        // Define the sort options for the fetched users based on createdAt field and provided sort order.
        const sortOptions = { createdAt: sortBy };

        const usersQuery = User.find(query)
        .sort(sortOptions)
        .skip(skipAmount)
        .limit(pageSize);

        // Count the total number of users that match the search criteria (without pagination).
        const totalUsersCount = await User.countDocuments(query);

        const users = await usersQuery.exec();

        // Check if there are more users beyond the current page.
        const isNext = totalUsersCount > skipAmount + users.length;

        return { users, isNext };
    } catch (error: any) {
        throw new Error(`Failed to fetch users: ${error.message}`)
    }
}

export async function getActivity(userId: string) {
    try {
      connectToDB();
  
      // Find all threads created by the user
      const userThreads = await Thread.find({ author: userId });
  
      // Collect all the child thread ids (replies) from the 'children' field of each user thread
      const childThreadIds = userThreads.reduce((acc, userThread) => {
        return acc.concat(userThread.children);
      }, []);
  
      // Find and return the child threads (replies) excluding the ones created by the same user
      const replies = await Thread.find({
        _id: { $in: childThreadIds },
        author: { $ne: userId }, // Exclude threads authored by the same user
      }).populate({
        path: "author",
        model: User,
        select: "name image _id",
      })
      .sort({ createdAt: -1 });
  
      return replies;
    } catch (error: any) {
      throw new Error(`Failed to fetch activity: ${error.message}`);
    }
  }

export async function getActivityLikes(userId: string) {
  try {
      connectToDB();

      // Find all threads created by the user
      const userThreads = await Thread.find({ author: userId });

      // Collect all the thread ids
      const threadIds = userThreads.map(thread => thread._id);

      // Find all replies authored by the user
      const userReplies = await Thread.find({ author: userId, parent: { $in: threadIds } });

      // Collect all the reply ids
      const replyIds = userReplies.map(reply => reply._id);

      // Fetch likes for all threads and replies concurrently
      const threadLikesPromises = threadIds.map(threadId => getLikes(threadId));
      const replyLikesPromises = replyIds.map(replyId => getLikes(replyId));

      // Wait for all likes promises to resolve
      const [threadLikes, replyLikes] = await Promise.all([
          Promise.all(threadLikesPromises),
          Promise.all(replyLikesPromises)
      ]);

      // Flatten the arrays of likes
      const allLikes = threadLikes.flat().concat(replyLikes.flat());

      // Sort the likes array based on the newest first
      allLikes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return allLikes;
  } catch (error: any) {
      throw new Error(`Failed to fetch activity likes: ${error.message}`);
  }
}

export async function fetchUserList() {
  try {
    // Fetch all users from the database
    const users = await User.find({}, '_id name');

    // Map over the users to extract the id and username fields
    const userList = users.map(user => ({
      id: user._id.toString(),
      display: user.name
    }));

    return userList;
  } catch (error) {
    // Handle any errors
    console.error('Error fetching user list:', error);
    throw error; // Propagate the error to the caller
  }
}

export async function saveMention(threadId: string, currentUserId: string, mentionId: string): Promise<void> {
  try {
    connectToDB();
    currentUserId = currentUserId.replace(/"/g, '')
    console.log("mentionid:", mentionId);
    console.log("threadId:", threadId);
    console.log("currentuser:", currentUserId);

    // Find the user being mentioned by its ID
    const user = await User.findById(mentionId);

    if (threadId === 'new') {
      // If threadId is 'new', fetch the thread array for currentUserId
      const currentUser = await User.findById(currentUserId);

      // If the current user is not found, throw an error
      if (!currentUser) {
          throw new Error(`Current user with ID ${currentUserId} not found.`);
      }

      // Get the threads array from the current user
      const threads = currentUser.threads;

      // If the threads array is empty, throw an error
      if (!threads || threads.length === 0) {
          throw new Error(`No threads found for current user ${currentUserId}.`);
      }

      // Use the last thread ID in the threads array as the threadId
      threadId = threads[threads.length - 1];
  }

    // If the user is found, push the mention details and save the changes
    if (user) {
      if (!user.mentions) {
        user.mentions = []; // Initialize the mentions array if it doesn't exist
      }
      user.mentions.push({ userId: new mongoose.Types.ObjectId(currentUserId), threadId: new mongoose.Types.ObjectId(threadId) }); // Convert string IDs to ObjectId
      await user.save();
    } else {
      throw new Error(`User with ID ${mentionId} not found.`);
    }
  } 
  catch (error: any) {
    throw new Error(`Failed to save mention: ${error.message}`);
  }
}

export async function fetchUserMentions(userId: string) {
  try {
    connectToDB();
    
    // Find the user by their ID and populate the mentions array with the necessary fields
    const user = await User.findById(userId).populate({
      path: 'mentions',
      populate: [
        { path: 'userId', select: 'name image' }, // Populate the user details for each mention
        { path: 'threadId', select: 'title' } // Populate the thread details for each mention
      ]
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    // Extract and return the populated mentions array
    return user.mentions;
  } catch (error: any) {
    throw new Error(`Failed to fetch user mentions: ${error.message}`);
  }
}
