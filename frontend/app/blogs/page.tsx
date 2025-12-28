"use client"

import { useSidebar } from "@/components/ui/sidebar";
import React from "react";
import { useAppData } from "../context/AppContext";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import BlogCard from "@/components/BlogCard";

const Blogs = () => {
  const { toggleSidebar } = useSidebar();
  const { loading, blogLoading, blogs } = useAppData();

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center my-5">
            <h1 className="text-3xl font-bold">Latest Blogs</h1>
            <Button
              onClick={toggleSidebar}
              className="flex items-center gap-2 px-4 bg-primary text-white"
            >
              <Filter size={18} />
              <span>Filter Blogs</span>
            </Button>
          </div>
          {
            blogLoading ? <Loading/> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {
                blogs?.length === 0 && <p>
                  No Blogs Yet 
                </p>
              }
              {
                blogs && blogs.map((e, i) => {
                  return <BlogCard 
                    key={i} 
                    image={e.image} 
                    title={e.title} 
                    desc={e.description} 
                    id={e.id} 
                    time={e.created_at}
                    category={e.category}
                    />
                })
              }
            </div>
          }
        </div>
      )}
    </div>
  );
};

export default Blogs;
