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
import { RefreshCw } from "lucide-react";
import Cookies from "js-cookie";
import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { author_service } from "@/app/context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export const blogCategories = [
  "Technology",
  "Health",
  "Finance",
  "Travel",
  "Education",
  "Entertainment",
  "Study",
];

const AddBlog = () => {
  const editor = useRef(null);

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: null,
    blogContent: "",
  });

  useEffect(() => {
    localStorage.setItem("blogDraft", JSON.stringify(formData)) ; 
  }, [formData])

  useEffect(() => {
    const saved = localStorage.getItem("blogDraft") ; 

    if(saved){
      const parsed = JSON.parse(saved) ; 
      setFormData(parsed) ; 
      setContent(parsed.blogContent || "")
    }
  }, [])

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

      const { data } = await axios.post(
        `${author_service}/api/v1/blog/new`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data.message);
      setFormData({
        title: "",
        description: "",
        category: "",
        image: null,
        blogContent: "",
      });

      localStorage.removeItem("blogDraft") ; 
      setContent("") ; 
    } catch (error) {
        toast.error("Error while adding blog.") ; 
        console.log("handle submit error: ", error)
    } finally {
        setLoading(false)
    }
  };

  const [AiTitle, setAiTitle] = useState(false) ;

  const aiTitleResponse = async () => {
    try {
      setAiTitle(true) ; 

      const {data} = await axios.post(`${author_service}/api/v1/ai/title`, {
        text: formData.title
      }) ; 

      setFormData({
        ...formData, 
        title: data 
      })
    } catch (error) {
      toast.error("Problem while fetching from AI") ; 

      console.log("AI title error: ", error)
    } finally {
      setAiTitle(false) ; 
    }
  }

  const [AiDescription, setAiDescription] = useState(false) ;

  const aiDescriptionResponse = async () => {
    try {
      setAiDescription(true) ; 

      const {data} = await axios.post(`${author_service}/api/v1/ai/description`, {
        title: formData.title,
        description: formData.description
      }) ; 

      setFormData({
        ...formData, 
        description: data 
      })
    } catch (error) {
      toast.error("Problem while fetching from AI") ; 

      console.log("AI description error: ", error)
    } finally {
      setAiDescription(false) ; 
    }
  }

  const [aiBlogLoading, setAiBlogLoading] = useState(false) ;

  const aiBlogResponse = async () => {
    try {
      setAiBlogLoading(true) ; 

      const {data} = await axios.post(`${author_service}/api/v1/ai/blog`, {
        blog: formData.blogContent
      }) ; 

      setContent(data.html) ; 
      setFormData({
        ...formData, 
        blogContent: data.html
      })
    } catch (error) {
      toast.error("Problem while fetching from AxI") ; 

      console.log("AI description error: ", error)
    } finally {
      setAiBlogLoading(false) ; 
    }
  }

  const config = useMemo(
    () => ({
      readOnly: false,
      placeholder: "Start typings...",
    }),
    []
  );

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
                className={AiTitle ? "animate-pulse placeholder:opacity-60": ""}
              />
              {formData.title==="" ? "" : <Button type="button"
              onClick={aiTitleResponse} disabled={AiTitle}
              >
                <RefreshCw className={AiTitle ? "animate-spin" : ""} />
              </Button>}
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
                className={
                  AiDescription ? "animate-pulse placeholder:opacity-60": ""
                }
              />
              {formData.title === "" ? (
                ""
              ): (<Button 
                type="button"
                onClick={aiDescriptionResponse}
                disabled={AiDescription}
              >
                <RefreshCw className={AiDescription ? "animate-spin" : ""}  />
              </Button>)}
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
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            <div>
              <Label>Blog Content</Label>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Paste your blog or type here. You can use rich text
                  formatting. Please add image after improving your grammer.
                </p>
                <Button 
                  type="button" 
                  size={"sm"}
                  onClick={aiBlogResponse}
                  disabled={aiBlogLoading}
                >
                  <RefreshCw 
                    size={16} className={aiBlogLoading ? "animate-spin": ""} />
                  <span className="ml-2">Fix Grammar</span>
                </Button>
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
                    blogContent: newContent
                  })
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

export default AddBlog;
