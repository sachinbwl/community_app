'use client'

import * as z from "zod";
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { 
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { usePathname, useRouter } from "next/navigation";
import { zodResolver } from '@hookform/resolvers/zod';
import { createThread } from "@/lib/actions/thread.action";
import { ThreadValidation } from "@/lib/validations/thread";
import { useOrganization } from "@clerk/nextjs";
import { Mention, MentionsInput } from 'react-mentions'; // Import Mention and MentionsInput
import defaultStyle from "../mentions/defaultStyle"; // Import defaultStyle if you have custom styles for mentions
import { saveMention } from "@/lib/actions/user.actions";
import { threadId } from "worker_threads";

interface Props {
    userId: string;
    userList: {id:string; display: string;}[];
}

function PostThread({ userId, userList }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const { organization } = useOrganization();
    const threadId = "new";

    const form = useForm<z.infer<typeof ThreadValidation>>({
        resolver: zodResolver(ThreadValidation),
        defaultValues: {
          thread: '',
          accountId: userId,
        },
    });

    const onSubmit = async (values: z.infer<typeof ThreadValidation>) => {
        const postToSend = values.thread.replace(/\@\[(.*?)\]\((.*?)\)/g, '@$1');
        await createThread({
            text: postToSend,
            author: userId,
            communityId: organization ? organization.id : null,
            path: pathname
        });

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
        
        const mentionIds = extractMentionIds(values.thread);
        console.log(mentionIds)
        // Call sendMention for each mention ID
        mentionIds.forEach((mentionId: string) => {
            saveMention(threadId, userId, mentionId);
        });
        
        router.push("/");
    }

    return (
        <Form {...form}>
            <form 
                onSubmit={form.handleSubmit(onSubmit)} 
                className="mt-10 flex flex-col justify-start gap-10"
            >
                <FormField
                    control={form.control}
                    name="thread"
                    render={({ field }) => (
                        <FormItem className="flex flex-col w-full gap-3">
                            <FormLabel className="text-base-semibold text-slate-900">
                                Content
                            </FormLabel>
                            <FormControl className="no-focus border border-green-900 bg-white shadow-md text-slate-900">
                                <MentionsInput
                                    value={field.value} // Pass field value to MentionsInput
                                    onChange={(e) => field.onChange(e.target.value)} // Update field value onChange
                                    style={defaultStyle} // Pass custom style if needed
                                >
                                    <Mention
                                        trigger="@"
                                        data={userList}
                                    />
                                </MentionsInput>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="bg-primary-500">
                    Post Thread
                </Button>
            </form>
        </Form>
    );
}

export default PostThread;
