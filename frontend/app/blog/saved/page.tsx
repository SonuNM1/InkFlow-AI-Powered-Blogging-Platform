"use client";

import { useAppData } from "@/app/context/AppContext";
import BlogCard from "@/components/BlogCard";
import Loading from "@/components/loading";
import React from "react";

const SavedBlogs = () => {
  const { blogs, savedBlogs } = useAppData();

  // show loading spinner until both blogs and savedBlogs are available

  if (!blogs || !savedBlogs) {
    return <Loading />;
  }

  // filter only those blogs which exist in savedBlogs

  const filteredBlogs = blogs.filter((blog) =>
    savedBlogs.some((saved) => saved.blogid === blog.id.toString())
  );

  return (
    // page wrapper. max-w-7xl: keeps content readable on large screens, mx-auto: centers horizontally, px-4/md:px-6 : give responsive side padding, py-10: adds vertical breathing space

    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Saved Blogs
        </h1>

        <p className="text-gray-500 mt-1">Blogs you bookmarked to read later</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8">
        {filteredBlogs.length > 0 ? (
          filteredBlogs.map((blog) => (
            // card wrapper to control width (KEY FIX)
            <div key={blog.id} className="flex justify-center">
              <div className="w-full max-w-[280px]">
                {/*
              max-w-[280px]:
              - prevents BlogCard from stretching horizontally
              - keeps all cards same width
              - fixes symmetry without touching BlogCard
            */}
                <BlogCard
                  image={blog.image}
                  title={blog.title}
                  desc={blog.description}
                  id={blog.id}
                  category={blog.category}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20">
            <p className="text-gray-500 text-lg">No saved blogs yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Save blogs to see them here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedBlogs;
