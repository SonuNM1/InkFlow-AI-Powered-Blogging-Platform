import Link from "next/link";
import React from "react";
import { Card } from "./ui/card";

interface BlogCardProps {
  image: string;
  title: string;
  desc: string;
  id: string;
  category: string;
}

const BlogCard: React.FC<BlogCardProps> = ({
  image,
  title,
  id,
  category,
}) => {
  return (
    <Link href={`/blog/${id}`} className="block">
      <Card
        className="
          relative
          h-[260px]
          overflow-hidden
          rounded-xl
          border
          bg-white
          transition-all
          hover:shadow-lg
        "
      >
        {/* IMAGE */}
        <div className="h-[150px] w-full overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* CONTENT */}
        <div className="px-4 pt-3">
          <h2 className="text-sm font-semibold line-clamp-1">
            {title}
          </h2>

        </div>

        {/* CATEGORY — FIXED AT CARD BOTTOM */}
        <span
          className="
            absolute
            bottom-3
            right-3
            text-[10px]
            px-2
            py-[2px]
            rounded-full
            bg-gray-100
            text-gray-700
            font-medium
          "
        >
          {category}
        </span>
      </Card>
    </Link>
  );
};

export default BlogCard;
