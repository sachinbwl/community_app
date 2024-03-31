"use client"

import * as z from "zod";
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { 
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { usePathname } from "next/navigation";
import { zodResolver } from '@hookform/resolvers/zod';
import { CommentValidation } from "@/lib/validations/thread";
import Image from "next/image";
import { addCommentToThread } from "@/lib/actions/thread.action";
import { useEffect, useState } from "react";
import { MentionsInput, Mention } from 'react-mentions';
import defaultStyle from "../mentions/defaultStyle";
import defaultMentionStyle from "../mentions/defaultMentionStyle";
import { saveMention } from "@/lib/actions/user.actions";


interface Props {
    threadId: string;
    currentUserImg: string;
    currentUserId: string;
    toggleFormVisibility?: () => void; // Function to toggle form visibility
    userList: {id:string; display: string;}[];
}


const Comment = ({ threadId, currentUserImg, currentUserId, toggleFormVisibility, userList }: Props) => {
    const pathname = usePathname();
    const [commentText, setCommentText] = useState("");
    const [submitted, setSubmitted] = useState(false); // State to track whether comment has been submitted

    const form = useForm({
        resolver: zodResolver(CommentValidation),
        defaultValues: {
          thread: '',
        },
    });

    const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
        // Replace mention markup with display names before posting the comment
        const commentToSend = commentText.replace(/\@\[(.*?)\]\((.*?)\)/g, '@$1');
        
        await addCommentToThread(threadId, commentToSend, JSON.parse(currentUserId), pathname);
        // Extract mention IDs from the comment text
        const extractMentionIds = (text: string): string[] => {
            const mentionIds: string[] = [];
            const regex = /\@\[.*?\]\((.*?)\)/g;
            let match: RegExpExecArray | null;
            while ((match = regex.exec(text)) !== null) {
                mentionIds.push(match[1]);
            }
            return mentionIds;
        };
        
        const mentionIds = extractMentionIds(commentText);
        console.log(mentionIds)
        // Call sendMention for each mention ID
        mentionIds.forEach((mentionId: string) => {
            saveMention(threadId, currentUserId, mentionId);
        });

        form.reset();
        setCommentText("");
        setSubmitted(true); // Set submitted state to true upon successful comment submission
        setTimeout(() => {
            setSubmitted(false); // Reset submitted state after a delay
            toggleFormVisibility?.(); // Toggle form visibility after a delay
        }, 3000); // Set the delay time in milliseconds 
    };

    // Event handler for textarea change
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setCommentText(e.target.value); // Update comment text state
    };


    return (
        <Form {...form}>
            <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="comment-form"
            >
            <FormField
                control={form.control}
                name="thread"
                render={({ field }) => (
                    <FormItem className="flex w-full items-center gap-3">
                    <FormLabel>
                        <Image 
                            src={currentUserImg}
                            alt="current_user"
                            width={48}
                            height={48}
                            className="rounded-full object cover"
                        />
                    </FormLabel>
                    <FormControl className="border border-black bg-transparent">
                        <div className="no-focus text-slate-900 outline-none resize-none w-full h-auto min-h-8 p-2 rounded-md">
                    <MentionsInput
                            value={commentText}
                            onChange={(e:any) => {
                                handleTextareaChange(e); // Call handleTextareaChange to update state
                                field.onChange(e); // Call react-hook-form's onChange function
                            }}
                            style={defaultStyle}
                        >
                            <Mention
                                trigger="@"
                                data={userList}
                                style={defaultMentionStyle}
                            />
                        </MentionsInput>
                        </div>
                    </FormControl>
                    </FormItem>
                )}
            />
            {submitted ? (
                <div className="thank-you-message">Thank you for your comment!</div>
            ) : (
            <Button type="submit" className="comment-form_btn">
                Reply
            </Button>
            )}
            </form>
        </Form>
    );
}

export default Comment;