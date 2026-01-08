"use client";

import { useSidebar } from "@/components/ui/sidebar";
import React, { useEffect } from "react";
import { useAppData } from "../context/AppContext";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import BlogCard from "@/components/BlogCard";
import Pagination from "@/components/Pagination";
import { useSearchParams, useRouter } from "next/navigation";

const BlogsClient = () => {
  const { toggleSidebar } = useSidebar();
  const { loading, blogs, blogLoading, pagination, setPage } = useAppData();

  const searchParams = useSearchParams();
  const router = useRouter();

  const pageFromUrl = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    setPage(pageFromUrl);
  }, [pageFromUrl, setPage]);

  if (loading) return <Loading />;

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center my-5">
          <h1 className="text-foreground font-bold">Latest Blogs</h1>

          <Button
            onClick={toggleSidebar}
            className="flex items-center gap-2 px-4 bg-primary text-primary-foreground"
          >
            <Filter size={18} />
            <span>Filter Blogs</span>
          </Button>
        </div>

        {blogLoading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {blogs?.length === 0 && (
              <p className="text-muted-foreground">No Blogs Yet</p>
            )}

            {blogs?.map((e) => (
              <BlogCard
                key={e.id}
                image={e.image}
                title={e.title}
                desc={e.description}
                id={e.id}
                category={e.category}
              />
            ))}
          </div>
        )}
      </div>

      <Pagination
        pagination={pagination}
        onPageChange={(page: number) => {
          router.push(`/blogs?page=${page}`);
        }}
      />
    </>
  );
};

export default BlogsClient;
