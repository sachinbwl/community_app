"use client"

import * as z from "zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useForm } from 'react-hook-form';
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { zodResolver } from '@hookform/resolvers/zod';
import { CommunityValidation } from "@/lib/validations/community";
import { isBase64Image } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing";
import { updateCommunityInfo } from "@/lib/actions/community.actions";


interface Props {
    community: {
      communityId: string;
      name: string;
      username: string;
      image: string;
      bio: string;
    };
    btnTitle: string;
}

const CommunityProfile = ({ community, btnTitle }: Props) => {
    const router = useRouter();
    const pathname = usePathname();
    const { startUpload } = useUploadThing("media");

    const [files, setFiles] = useState<File[]>([]);
    const form = useForm<z.infer<typeof CommunityValidation>>({
        resolver: zodResolver(CommunityValidation),
        defaultValues: {
          profile_photo: community?.image || "",
          name: community?.name || "",
          username: community?.username || "",
          bio: community?.bio || "",
        },
      });

    const handleImage = (e: ChangeEvent<HTMLInputElement>,
        fieldChange: (value: string) => void) => {
        e.preventDefault();
        const fileReader = new FileReader();

        if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          setFiles(Array.from(e.target.files));
    
          if (!file.type.includes("image")) return;
    
          fileReader.onload = async (event) => {
            const imageDataUrl = event.target?.result?.toString() || "";
            fieldChange(imageDataUrl);
          };
    
          fileReader.readAsDataURL(file);
        }
    };

    const onSubmit = async (values: z.infer<typeof CommunityValidation>) => {
      const blob = values.profile_photo;
  
      const hasImageChanged = isBase64Image(blob);
      if (hasImageChanged) {
          const imgRes = await startUpload(files);
  
          if (imgRes && imgRes[0].url) {
              values.profile_photo = imgRes[0].url;
          }
      }
  
      try {
          // Update community name, username, and image
          await updateCommunityInfo({
            communityId: community.communityId,
            name: values.name,
            username: values.username,
            image: values.profile_photo,
            bio: values.bio,
      });
        // Redirect to the community details page after a delay
        setTimeout(() => {
            router.push(`/communities/${community.communityId}`);
        }, 1000); // 1-second delay
  
      } catch (error) {
          console.error("Error updating community information:", error);
          // Handle error
      }
  };
  

    return (
        <Form {...form}>
            <form 
                onSubmit={form.handleSubmit(onSubmit)} 
                className="flex flex-col justify-start gap-10"
            >
                <FormField
                    control={form.control}
                    name="profile_photo"
                    render={({ field }) => (
                        <FormItem className="flex items-center gap-4">
                            <FormLabel className="account-form_image-label">
                            {field.value ? (
                                <Image
                                    src={field.value}
                                    alt='community_photo'
                                    width={96}
                                    height={96}
                                    priority
                                    className='rounded-full object-contain'
                                />
                            ) : (
                                <Image
                                    src='/assets/community.svg'
                                    alt='community_icon'
                                    width={24}
                                    height={24}
                                    className='object-contain'
                                />
                            )}
                            </FormLabel>
                            <FormControl className="flex-1 text-base-semibold text-gray-400">
                                <Input
                                    type='file'
                                    accept='image/*'
                                    placeholder='Upload a community photo'
                                    className='account-form_image-input'
                                    onChange={(e) => handleImage(e, field.onChange)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="flex flex-col w-full gap-3">
                            <FormLabel className="text-base-semibold text-slate-900">
                            Name
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    className='account-form_input no-focus'
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='username'
                    render={({ field }) => (
                        <FormItem className='flex flex-col w-full gap-3'>
                            <FormLabel className='text-base-semibold text-slate-900'>
                            Username
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type='text'
                                    className='account-form_input no-focus'
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='bio'
                    render={({ field }) => (
                        <FormItem className='flex flex-col w-full gap-3'>
                            <FormLabel className='text-base-semibold text-slate-900'>
                            Bio
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    rows={10}
                                    className='account-form_input no-focus'
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="bg-primary-500">
                    {btnTitle}
                </Button>
            </form>
        </Form>
    );
};

export default CommunityProfile;
