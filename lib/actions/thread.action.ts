"use server"

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import Community from "../models/community.model";
import { connectToDB } from "../mongoose";
import mongoose from "mongoose";


export async function fetchPosts(pageNumber = 1, pageSize = 20) {
    try {
        connectToDB();
        
        // Calculate the number of posts to skip
        const skipAmount = (pageNumber - 1) * pageSize;

        // Fetch the posts that have no parents (top-level threads...)
        const postsQuery = Thread.find({ parentId: { $in: [null, undefined]}})
            .sort({ createAt: 'desc' })
            .skip(skipAmount)
            .limit(pageSize)
            .populate({ path: 'author', model: User })
            .populate({
              path: "community",
              model: Community,
            })
            .populate({
                path: 'children' ,
                populate: {
                    path: 'author',
                    model: User,
                    select: "_id name parentId image",
                }
            })
            .populate({
              path: 'likes' ,
              model: User,
              select: "id name image",
            });

        const totalPostsCount = await Thread.countDocuments({
          parentId: { $in: [null, undefined] },
        }); //Get the total count of posts

        const posts = await postsQuery.exec();
        const isNext = totalPostsCount > skipAmount + posts.length;
        return { posts, isNext };

    } catch (error: any) {
        throw new Error(`Error creating thread: ${error.message}`)
    }
}

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string,
}

export async function createThread({ text, author, communityId, path }: Params) {
   try {
    connectToDB();
    
    author = author.replace(/^"(.*)"$/, '$1');

    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1}
    );    

    const createdThread = await Thread.create({
        text,
        author,
        community: communityIdObject,
    });

    // Update user model
    await User.findByIdAndUpdate(author, {
        $push: { threads: createdThread._id },
    });

    if (communityIdObject) {
      // Update Community model
      await Community.findByIdAndUpdate(communityIdObject, {
        $push: { threads: createdThread._id },
      });
    }

    revalidatePath(path);
   } catch (error: any) {
    throw new Error(`Error creating thread: ${error.message}`)
   }
   
}

export async function fetchAllChildThreads(threadId: string): Promise<any[]> {
  const childThreads = await Thread.find({ parentId: threadId });

  const descendantThreads = [];
  for (const childThread of childThreads) {
    const descendants = await fetchAllChildThreads(childThread._id);
    descendantThreads.push(childThread, ...descendants);
  }

  return descendantThreads;
}

export async function deleteThread(id: string, path: string): Promise<void> {
  try {
    connectToDB();

    // Find the thread to be deleted (the main thread)
    const mainThread = await Thread.findById(id).populate("author community");

    if (!mainThread) {
      throw new Error("Thread not found");
    }

    // Fetch all child threads and their descendants recursively
    const descendantThreads = await fetchAllChildThreads(id);

    // Get all descendant thread IDs including the main thread ID and child thread IDs
    const descendantThreadIds = [
      id,
      ...descendantThreads.map((thread) => thread._id),
    ];

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.community?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.community?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // Recursively delete child threads and their descendants
    await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

    // Update User model
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    // Update Community model
    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
}

export async function fetchThreadById(threadId: string) {
    connectToDB();
  
    try {
      const thread = await Thread.findById(threadId)
        .populate({
          path: "author",
          model: User,
          select: "_id id name image",
        }) // Populate the author field with _id and username
        .populate({
          path: "community",
          model: Community,
          select: "_id id name image",
        }) // Populate the community field with _id and name
        .populate({
          path: "children", // Populate the children field
          populate: [
            {
              path: "author", // Populate the author field within children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
            {
              path: "children", // Populate the children field within children
              model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
              populate: {
                path: "author", // Populate the author field within nested children
                model: User,
                select: "_id id name parentId image", // Select only _id and username fields of the author
              },
            },
            {
              path: 'likes',
              model: User,
              select: "id name image",
            },
          ],
        })
        .populate({
          path: 'likes' ,
          model: User,
          select: "id name image",
        })

        .exec();
  
      return thread;
    } catch (error: any) {
      throw new Error(`Error fetching thread: ${error.message}`);
    }
  }

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    // Find the original thread by its ID
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error("Thread not found");
    }

    // Create the new comment thread
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId, // Set the parentId to the original thread's ID
    });

    // Save the comment thread to the database
    const savedCommentThread = await commentThread.save();

    // Add the comment thread's ID to the original thread's children array
    originalThread.children.push(savedCommentThread._id);

    // Save the updated original thread to the database
    await originalThread.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error adding comment to thread: ${error.message}`);
  }
}

export async function likeThread(threadId: string, userId: string, path: string) {
  try {
    console.log("usedId:", userId);
    console.log("ThreadId:", threadId)
    connectToDB();

    // Find the thread by its ID
    const thread = await Thread.findById(threadId);

    if (!thread) {
      throw new Error("Thread not found");
    }
    // Example: Fetching the actual MongoDB ObjectId using the custom user ID
    const user = await User.findOne({ id: userId }); // Adjust the query according to your schema
    if (!user) {
      throw new Error('User not found');
    }
    const userIdObject = user._id; // This is the actual ObjectId of the user

    //console.log("UserIdObject:", userIdObject); // Log the userIdObject

    // Initialize a variable to track whether the thread was liked or unliked
    let actionResult = '';

    // Check if the user has already liked the thread
    const userAlreadyLikedIndex = thread.likes.findIndex((id: mongoose.Types.ObjectId) => id.equals(userIdObject));

    if (userAlreadyLikedIndex !== -1) {
      // User has already liked the thread, so remove their like (unlike)
      thread.likes.splice(userAlreadyLikedIndex, 1);
      actionResult = 'unliked';
    } else {
      // User has not liked the thread yet, so add their like
      thread.likes.push(userIdObject);
      actionResult = 'liked';
    }

    // Save the updated thread to the database
    await thread.save();

    // Revalidate the page to reflect the updated likes
    revalidatePath(path);

    return { message: `Thread ${actionResult} successfully.` };
  } catch (error: any) {
    throw new Error(`Error updating like status for thread: ${error.message}`);
  }
}

export async function getThreadLikes(threadId: string) {
  try {
    connectToDB();

    // Find the thread by its ID and populate the likes array to get user details
    const thread = await Thread.findById(threadId)
      .populate({
        path: "likes",
        model: User, // Assuming "User" is your User model name
        select: "id name image", // Adjust according to what user information you want to return
      })
      .exec();

    if (!thread) {
      throw new Error("Thread not found");
    }

    return thread.likes;
  } catch (error: any) {
    throw new Error(`Error fetching likes: ${error.message}`);
  }
}

export async function reportThread(threadId: string, userId: string, reason: string) {
  try {
    connectToDB();
    // Find the thread by its ID
    const thread = await Thread.findById(threadId);

    if (!thread) {
      throw new Error("Thread not found");
    }

    // Initialize the reports array if it doesn't exist
    if (!thread.reports) {
      thread.reports = [];
    }

    // Add the user's report to the thread's reports array
    thread.reports.push(reason);

    // Save the updated thread to the database
    await thread.save();
    revalidatePath(threadId)

    return { message: "Thread reported successfully." };
  } catch (error: any) {
    throw new Error(`Error reporting thread: ${error.message}`);
  }
}

export async function getLikes(threadId: string) {
  try {
    connectToDB();

    // Find the thread by its ID and populate the likes array to get user details
    const thread = await Thread.findById(threadId)
        .populate({
            path: "likes",
            model: User, // Assuming "User" is your User model name
            select: "id name image", // Adjust according to what user information you want to return
        })
        .exec();

    if (!thread) {
        throw new Error("Thread not found");
    }

    // Map the likes array to include the threadId
    const likesWithThreadId = thread.likes.map((like: { toObject: () => any; }) => ({
        ...like.toObject(), // Convert Mongoose document to plain JavaScript object
        threadId: threadId
    }));

    return likesWithThreadId;
} catch (error: any) {
    throw new Error(`Error fetching likes: ${error.message}`);
}
}

export async function lockThread(threadId: string) {
  try {
    connectToDB();

    // Find the thread by its id and update the locked field to true
    const updatedThread = await Thread.findByIdAndUpdate(
      threadId,
      { locked: true },
      { new: true }
    );

    if (!updatedThread) {
      throw new Error("Thread not found");
    }

    return updatedThread;
  } catch (error) {
    console.error("Error locking thread:", error);
    throw error;
  }
}

export async function unlockThread(threadId: string) {
  try {
    connectToDB();

    // Find the thread by its id and update the locked field to false
    const updatedThread = await Thread.findByIdAndUpdate(
      threadId,
      { locked: false },
      { new: true }
    );

    if (!updatedThread) {
      throw new Error("Thread not found");
    }

    return updatedThread;
  } catch (error) {
    console.error("Error unlocking thread:", error);
    throw error;
  }
}
