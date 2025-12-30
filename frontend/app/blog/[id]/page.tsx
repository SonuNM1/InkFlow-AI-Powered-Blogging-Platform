"use client";

import { author_service, Blog, blog_service, useAppData, User } from "@/app/context/AppContext";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Bookmark,
  BookmarkCheck,
  Edit,
  Trash2,
  Trash2Icon,
  User2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import axios from "axios";

// Types - defines the shape of a comment object coming from backend 
interface Comment {
  id: string;
  userid: string;
  comment: string;
  create_at: string;
  username: string;
  userimage: string 
}

const BlogPage = () => {

  // Global state from context. isAuth - user logged in or not, user - logged in user data, savedBlogs - blogs saved by user, fetchBlogs - refresh blog list after delete, getSavedBlogs - refresh saved blogs 

  const { isAuth, user, fetchBlogs, savedBlogs, getSavedBlogs } = useAppData();

  const { id } = useParams(); // blog id from Url 
  const router = useRouter(); // for navigation 

  const [blog, setBlog] = useState<Blog | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [saved, setSaved] = useState(false) ; 

  // fetch single blog - called when page loads. Fetches blog data + author

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

  // fetch comments for blog - gets all comments related to the blog id

  async function fetchComment() {
    try {
      setLoading(true);

      const { data } = await axios.get(`${blog_service}/api/v1/comments/${id}`);

      setComments(data);
    } catch (error) {
      console.log("Fetch comment error: ", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComment();
    fetchSingleBlog();
  }, [id]);

  // Save / Unsave blog - toggles bookmark state  

  async function saveBlog(){
    const token = Cookies.get("token") ; 

    try {
      setLoading(true) ; 

      const {data} = await axios.post(
        `${blog_service}/api/v1/save/${id}`, 
        {}, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      toast.success(data.message) ; 
      setSaved(!saved) ; 

      getSavedBlogs() ; 
    } catch (error) {
      toast.error("Problem while saving blog.") ; 

      console.log("Save blog error:", error) ; 
    } finally {
      setLoading(false) ; 
    }
  }

  // check if blog is saved 

  useEffect(() =>{
    if(savedBlogs && savedBlogs.some((b) => b.blogid === id)){
      setSaved(true) ; 
    } else {
      setSaved(false) ; 
    }
  }, [savedBlogs, id])

  if (!blog) {
    return <Loading />;
  }

  // Add comment - requires authentication. Uses JWT token from cookies 

  async function addComment() {
    try {
      setLoading(true);

      const token = Cookies.get("token");

      if(!token){
        toast.error("You must be logged in to comment.") ;
        return ; 
      }

      const { data } = await axios.post(
        `${blog_service}/api/v1/comment/${id}`,
        {
          comment, 
          username: user?.name 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data.message);
      setComment("");

      fetchComment();
    } catch (error) {
      toast.error("Problem while adding comment");
      console.log("Add comment error: ", error);
    } finally {
      setLoading(false);
    }
  }

  // only comment owner can delete

  const deleteComment = async (id: string) => {
    if (confirm("Are your sure you want to delete this comment?")) {
      try {
        setLoading(true);

        const token = Cookies.get("token");

        console.log("Deleting commentId from UI: ", id)

        const { data } = await axios.delete(
          `${blog_service}/api/v1/comments/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success(data.message);

        fetchComment();
      } catch (error) {
        toast.error("Problem while deleting comment");
        console.log("Delete comment error: ", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // only blog owner can delete 

  async function deleteBlog() {
    if (confirm("Are your sure you want to delete this blog?")) {
      try {
        setLoading(true);

        const token = Cookies.get("token");

        const { data } = await axios.delete(
          `${author_service}/api/v1/blog/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success(data.message);

        router.push("/blogs")  ;
        
        setTimeout(() => {
          fetchBlogs()
        }, 4000);
      } catch (error) {
        toast.error("Problem while deleting blog");
        console.log("Delete blog error: ", error);
      } finally {
        setLoading(false);
      }
    }
  }  

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">

      {/* Blog header */}

      <header className="space-y-4">
        <h1 className="text-4xl font-bold">
          {blog.title}
        </h1>

        {/* Author + Actions */}

        <div className="flex items-center justify-between text-sm text-gray-600">
          <Link
            href={`/profile/${author?._id}`}
            className="flex items-center gap-2"
          >
            <img
              src={author?.image}
              className="w-8 h-8 rounded-full"
              alt=""
            />
              {author?.name}
          </Link>

          <div className="flex gap-2">
            {
              isAuth && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={saveBlog}
                >
                  {
                    saved ? <BookmarkCheck/> : <Bookmark/>
                  }
                </Button>
              )
            }

            {
              blog.author === user?._id && (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => router.push(`/blog/edit/${id}`)}
                  >
                    <Edit/>
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={deleteBlog}
                  >
                    <Trash2/>
                  </Button>
                </>
              )
            }
          </div>
        </div>
      </header>

      {/* Blog image */}

      <img
        src={blog.image}
        alt=""
        className="w-full h-[420px] object-cover rounded-xl"
      />
     
      {/* Blog description */}

      <p className="text-lg text-gray-700">
        {blog.description}
      </p>

      {/* Blog content */}

      <article
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{__html: blog.blogcontent}}
      />

      {/* Comment form */}

      {
        isAuth && (
          <Card className="border">
            <CardContent className="space-y-4 p-6">
              <h3 className="text-xl font-semibold">
                Leave a comment 
              </h3>

              <div>
                <Input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write something thoughtful..."
                />
              </div>

              <Button
                onClick={addComment}
                disabled={loading}
              >
                {
                  loading ? "Adding Comment" : "Post Comment"
                }
              </Button>

            </CardContent>
          </Card>
        )
      }

      {/* Comments list */}

      <section className="space-y-4">
        <h3 className="text-xl font-semibold">
          Comments ({comments.length})
        </h3>

        {
          comments.length>0 ? (
            comments.map((c) => (
              <div
                key={c.id}
                className="flex gap-4 border rounded-xl p-4"
              >
                {/* Comment content */}

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium text-gray-800">
                      {c.username || "User"}
                    </span>
                    <span>•</span>
                    <span>
                      {
                        new Date(c.create_at).toLocaleDateString()
                      }
                    </span>
                  </div>
                  <p className="text-gray-700">
                    {c.comment}
                  </p>
                </div>

                      {/* comment delete button - only the comment owner can delete */}

                {
                  c.userid === user?._id && (
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={()=> deleteComment(c.id)}
                    >
                      <Trash2/>
                    </Button>
                  )
                }
              </div>
            ))
          ) : (
            <p className="text-gray-500">
              No comments yet.
            </p>
          )
        }
      </section>

    </div>
  );
};

export default BlogPage;
