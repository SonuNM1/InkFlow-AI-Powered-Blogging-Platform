"use client";

import { Blog, blog_service, useAppData, User } from "@/app/context/AppContext";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Bookmark, Delete, Edit, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const BlogPage = () => {
  const { isAuth, user } = useAppData();
  const { id } = useParams();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchSingleBlog() {
    try {
      setLoading(true);

      const { data } = await axios.get(`${blog_service}/api/v1/blog/${id}`);

      setBlog(data.blog);
      setAuthor(data.author);
    } catch (error) {
      console.log("fetch single blog error: ", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSingleBlog();
  }, [id]);

  if (!blog) {
    return <Loading />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <h1 className="text-3xl font-bold text-gray-900">{blog.title}</h1>
          <p className="text-gray-600 mt-2 flex items-center">
            <Link
              className="flex items-center gap-2"
              href={`/profile/${author?._id}`}
            >
              <img
                src={author?.image}
                alt=""
                className="w-8 h-8 rounded-full"
              />
              {author?.name}
            </Link>
            {isAuth && (
              <Button variant={"ghost"} className="mx-3" size={"lg"}>
                <Bookmark />
              </Button>
            )}
            {blog.author === user?._id && (
              <>
                <Button size={"sm"}>
                  <Edit />
                </Button>
                <Button 
                variant={"destructive"}
                className="mx-2"
                size={"sm"}>
                  <Trash2Icon />
                </Button>
              </>
            )}
          </p>
        </CardHeader>
      </Card>
    </div>
  );
};

export default BlogPage;
