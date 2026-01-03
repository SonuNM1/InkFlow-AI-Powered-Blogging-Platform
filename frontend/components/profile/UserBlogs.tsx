"use client";

import { Button } from "@/components/ui/button";
import UserBlogItem from "./UserBlogItem";
import { useRouter } from "next/navigation";
import Loading from "../loading";
import { Plus } from "lucide-react";

/**
 * UserBlogs
 * ---------
 * Shows create button + user's blogs list.
 */
const UserBlogs = ({ blogs, loading }: any) => {
  const router = useRouter();

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Your Blogs ({blogs.length})</h3>

        <div className="mr-10">
          <Button 
            onClick={() => router.push("/blog/new")}
            className="flex items-center gap-2"
           >
            <Plus size={16}/>
            Create Blog
           </Button>
        </div>
      </div>

      {/* Blog list */}
      {blogs.length === 0 ? (
        <p className="text-muted-foreground">
          No blogs yet. Start writing your first one ✍️
        </p>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog: any) => (
            <UserBlogItem key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBlogs;
