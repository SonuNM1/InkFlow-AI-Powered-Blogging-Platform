"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  author_service,
  blog_service,
  useAppData,
  blogCategories,
} from "@/app/context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams, useRouter } from "next/navigation";
import type { SingleBlogResponse } from "@/types";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

interface ApiResponse {
   message: string; 
}

const EditBlogPage = () => {
  const editor = useRef(null);
  const { id } = useParams();

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const { fetchBlogs } = useAppData();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: null,
    blogContent: "",
  });

  useEffect(() => {
    localStorage.setItem("blogDraft", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    const saved = localStorage.getItem("blogDraft");

    if (saved) {
      const parsed = JSON.parse(saved);
      setFormData(parsed);
      setContent(parsed.blogContent || "");
    }
  }, []);

  const handleInputChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      image: file,
    });
  };

  const config = useMemo(
    () => ({
      readOnly: false,
      placeholder: "Start typings...",
    }),
    []
  );

  const [existingImage, setExistingImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);

      try {
        const { data } = await axios.get<SingleBlogResponse>(`${blog_service}/api/v1/blog/${id}`);

        const blog = data?.blog;

        setFormData({
          title: blog.title,
          description: blog.description,
          category: blog.category,
          image: null,
          blogContent: blog.blogcontent,
        });

        setContent(blog.blogcontent);
        setExistingImage(blog.image ?? null);
      } catch (error) {
        console.log("Edit page error: ", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBlog();
  }, [id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();

    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("blogcontent", formData.blogContent);
    formDataToSend.append("category", formData.category);

    if (formData.image) {
      formDataToSend.append("file", formData.image);
    }

    try {
      const token = Cookies.get("token");

      const { data } = await axios.post<ApiResponse>(
        `${author_service}/api/v1/blog/${id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data.message);
      fetchBlogs();

      localStorage.removeItem("blogDraft");
      setContent("");
    } catch (error) {
      toast.error("Error while adding blog.");
      console.log("handle submit error: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Add New Blog</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Label>Title</Label>
            <div className="flex justify-center items-center gap-2">
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter Blog title"
                required
              />
            </div>

            {/* Description */}

            <Label>Description</Label>
            <div className="flex justify-center items-center gap-2">
              <Input
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter Blog description"
                required
              />
            </div>

            <Label>Category</Label>
            <Select
              onValueChange={(value: any) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={formData.category || "Select Category"}
                />
              </SelectTrigger>
              <SelectContent>
                {blogCategories?.map((e, i) => (
                  <SelectItem key={i} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <Label>Image Upload</Label>
              {existingImage && !formData.image && (
                <img
                  src={existingImage}
                  className="w-40 h-40 object-cover rounded mb-2"
                  alt=""
                />
              )}
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            <div>
              <Label>Blog Content</Label>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Paste your blog or type here. You can use rich text
                  formatting. Please add image after improving your grammer.
                </p>
              </div>
              <JoditEditor
                ref={editor}
                value={content}
                config={config}
                tabIndex={1}
                onBlur={(newContent) => {
                  setContent(newContent);
                  setFormData({
                    ...formData,
                    blogContent: newContent,
                  });
                }}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting" : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditBlogPage;
