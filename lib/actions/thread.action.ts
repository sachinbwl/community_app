"use server"

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string,
}

export async function createThread({ text, author, communityId, path }: Params) {
   try {
     connectToDB();

    const createdThread = await Thread.create({
        text,
        author,
        community: null,
    });

    // Update user model
    await User.findByIdAndUpdate(author, {
        $push: { threads: createdThread._id },
    });

    revalidatePath(path);
   } catch (error: any) {
    throw new Error(`Error creating thread: ${error.message}`)
   }
   
};

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
                path: 'children' ,
                populate: {
                    path: 'author',
                    model: User,
                    select: "_id name parentId image"
                }
            })

        const totalPostsCount = await Thread.countDocuments({ parentId: { $in:
        [null, undefined]}})

        const posts = await postsQuery.exec();
        const isNext = totalPostsCount > skipAmount + posts.length;
        return { posts, isNext };

    } catch (error: any) {
        throw new Error(`Error creating thread: ${error.message}`)
    }
}

export async function fetchThreadById(id: string) {
    connectToDB();
  
    try {
      const thread = await Thread.findById(id)
        .populate({
          path: "author",
          model: User,
          select: "_id id name image",
        }) // Populate the author field with _id and username
       // todo Populate the community field with _id and name
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
          ],
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