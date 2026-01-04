"use client";

import React from "react";
import { Card } from "../ui/card";
import { useRouter } from "next/navigation";

const UserBlogItem = ({ blog }: { blog: any }) => {

  const router = useRouter();

  return (
    <Card
      onClick={() => router.push(`/blog/${blog.id}`)}
      className="p-4 flex flex-row items-start gap-4 flex-nowrap cursor-pointer hover:shadow-lg transition"
    >
      <img
        src={blog.image}
        alt={blog.title}
        className="w-28 h-24 object-cover rounded-lg flex-shrink-0 block"
      />

      {/* Text Container */}

      <div className="flex flex-col justify-center min-w-0">
        <div>
          <h4 className="font-semibold text-base leading-snug line-clamp-1"> 
            {blog.title}
          </h4>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {blog.descriptin}
          </p>
        </div>

        {/* subtle meta row */}

        <span className="text-xs text-muted-foreground mt-2">
          Click to view →
        </span>

      </div>

    </Card>
  );
};

export default UserBlogItem;
