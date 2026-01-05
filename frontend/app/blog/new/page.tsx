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
import { author_service, useAppData } from "@/app/context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
import { ButtonSkeleton } from "@/components/skeletons/ButtonSkeleton";
import { handleAIClientError } from "@/lib/aiErrorHandler";
import { aiDebounce } from "@/lib/debounce";

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

  const { fetchBlogs } = useAppData();

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    blogContent: "",
  });

  // holds the actual image file (used only for submit)

  const [imageFile, setImageFile] = useState<File | null>(null);

  // holds preview URL for UI display

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Used for drag & drop UI feedback

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      "blogDraft",
      JSON.stringify({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        blogContent: formData.blogContent,
      })
    );
  }, [formData]);

  useEffect(() => {
    const saved = localStorage.getItem("blogDraft");

    if (saved) {
      const parsed = JSON.parse(saved);
      setFormData((prev) => ({
        ...prev, 
        ...parsed 
      }));
      setContent(parsed.blogContent || "");
    }
  }, []);

  const handleInputChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // handles image selection via file input

  const handleImageSelect = (file: File) => {
    // allow only images

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Cleanup old preview

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    // Create browser preview URL

    const previewUrl = URL.createObjectURL(file);

    setImageFile(file);
    setImagePreview(previewUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    handleImageSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    handleImageSelect(file);
  };

  // extracts plain text from HTML content. Used to validate editor content

  const getPlainText = (html: string) => {
    return html
      .replace(/<[^>]*>/g, "") // remove HTML tags
      .replace(/&nbsp;/g, " ")
      .trim();
  };

  // Confirms overwrite if field already has content

  const confirmOverwrite = (fieldName: string) => {
    return window.confirm(
      `This will overwrite your existing ${fieldName}. Continue?`
    );
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const plainText = getPlainText(formData.blogContent);
    const wordCount = getWordCount(formData.blogContent);

    // editor empty

    if (!plainText) {
      toast.error("Blog content cannot be empty");
      return;
    }

    // less than 200 words

    if (wordCount < 50) {
      toast.error("Blog must be at least 50 words");
      return;
    }

    // image missing

    if (!imageFile) {
      toast.error("Please upload a cover image");
      return;
    }

    // starting loader only after validation passes

    setLoading(true);

    const formDataToSend = new FormData();

    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("blogcontent", formData.blogContent);
    formDataToSend.append("category", formData.category);

    if (imageFile) {
      formDataToSend.append("file", imageFile);
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

      // reset text fields

      setFormData({
        title: "",
        description: "",
        category: "",
        blogContent: "",
      });

      setContent(""); // reset editor

      removeImage(); // reset image state + preview

      localStorage.removeItem("blogDraft"); // clears draft

      fetchBlogs(); // refresh blogs
    } catch (error) {
      toast.error("Error while adding blog.");
      console.log("handle submit error: ", error);
    } finally {
      setLoading(false);
    }
  };

  // Removes selected image and clears preview. Also revokes object URL to prevent memory leaks

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    setImagePreview(null);
  };

  const [AiTitle, setAiTitle] = useState(false);

  const aiTitleResponse = aiDebounce(async () => {

    const token = Cookies.get("token") ; 

    if (formData.title && !confirmOverwrite("title")) return;

    try {
      setAiTitle(true);

      const { data } = await axios.post(
        `${author_service}/api/v1/ai/title`, 
        { text: formData.title }, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setFormData((prev) => ({
        ...prev, 
        title: data.title 
      }))
    } catch (error) {
      handleAIClientError(error) ; 
    } finally {
      setAiTitle(false);
    }
  });

  const [AiDescription, setAiDescription] = useState(false);

  const aiDescriptionResponse = aiDebounce(async () => {

    const token = Cookies.get("token") ; 

    if (formData.description && !confirmOverwrite("description")) return;

    try {
      setAiDescription(true);

      const { data } = await axios.post(
        `${author_service}/api/v1/ai/description`,
        {
          title: formData.title,
          description: formData.description,
          forceRegenerate: true 
        }, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setFormData({
        ...formData,
        description: data.description,
      });
    } catch (error) {
      handleAIClientError(error) ; 
    } finally {
      setAiDescription(false);
    }
  })

  const [aiBlogLoading, setAiBlogLoading] = useState(false);

  const aiBlogResponse = aiDebounce(async () => {

    const token = Cookies.get("token")

    const plainText = getPlainText(formData.blogContent) ; 

    if(!plainText){
      toast.error("Please write some blog content before using AI.") ; 
      return ; 
    }

    try {
      setAiBlogLoading(true);

      const { data } = await axios.post(`${author_service}/api/v1/ai/blog`, {
        blog: formData.blogContent,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setContent(data.html);
      setFormData({
        ...formData,
        blogContent: data.html,
      });
    } catch (error) {
      handleAIClientError(error) ;
    } finally {
      setAiBlogLoading(false);
    }
  })

  const config = useMemo(
    () => ({
      readOnly: false,
      placeholder: "Start typings...",
    }),
    []
  );

  const getWordCount = (html: string) => {
    const text = getPlainText(html);

    if (!text) return 0;

    return text.split(/\s+/).length;
  };

  // word counter 

  const wordCount = getWordCount(formData.blogContent) ;
  const isWordCountInvalid = wordCount > 0 && wordCount < 50 ;  // wordCount > 0, don't scare user before typing 

  const isSubmitDisabled =
    loading ||
    !formData.title ||
    !formData.description ||
    !formData.category ||
    !imageFile ||
    getWordCount(formData.blogContent) < 50;

  const isBlogEmpty = getPlainText(formData.blogContent).length === 0 ; 

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Add New Blog</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Label>Title</Label>
            <div className="flex items-center gap-2">
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter blog title"
                required 
              />

              {/* AI Enhance button - always visible, disabled if title is empty, shows loading state while AI runs */}

              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!formData.title || AiTitle}
                onClick={aiTitleResponse}
                title="Improve grammar and clarity using AI"
                className="flex items-center gap-1"
              >
                <span className={AiTitle ? "animate-pulse": ""}>
                  ✨
                </span>
                {
                  AiTitle ? "AI Working..." : "AI Enhance"
                }
              </Button>
            </div>

            {/* Description + AI Enhance */}

            <Label>Description</Label>
            <div className="flex items-center gap-2">
              <Input
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter blog description"
                required
              />

              {/* AI Enhance button - matches title UX for consistency, prevents overwrite without confirmation */}
              
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!formData.title || AiDescription}
                onClick={aiDescriptionResponse}
                title="Improve grammar and clarity using AI"
                className="flex items-center gap-1"
              >
                <span className={AiDescription ? "animate-pulse" : ""}>
                  ✨
                </span>
                {
                  AiDescription ? "AI Working..." : "AI Enhance"
                }
              </Button>
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

            <div className="space-y-2">
              <Label>Image Upload</Label>

              {/* Drag & Drop Zone */}

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative flex items-center justify-center border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                  isDragging ? "border-primary bg-primary/10" : "border-border"
                }`}
              >
                {/* hidden input */}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                {!imagePreview ? (
                  <p className="text-sm text-muted-foreground">
                    Drag & drop an image here or click to upload
                  </p>
                ) : (
                  <div className="relative">
                    {/* Preview */}
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-48 rounded-md object-cover"
                    />

                    {/* remove button */}

                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      X
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Blog Content</Label>
              <div className="flex justify-between items-start gap-4 mt-2 mb-4">
                <p className="text-sm text-muted-foreground max-w-[70%] leading-relaxed">
                  Paste your blog or type here. You can use rich text
                  formatting. Please add image after improving your grammer.
                </p>
                <Button
                  type="button"
                  size={"sm"}
                  onClick={aiBlogResponse}
                  disabled={aiBlogLoading || isBlogEmpty}
                  title="✨ AI-Powered Grammar Correction"
                  className="shrink-0"
                >
                  <RefreshCw
                    size={16}
                    className={aiBlogLoading ? "animate-spin" : ""}
                  />
                  <span className="ml-2">
                    {
                      aiBlogLoading ? "AI Working..." : "✨ AI Magic"
                    }
                  </span>
                </Button>
              </div>
              <div className="mt-3">
                <JoditEditor
                  ref={editor}
                  value={content}
                  config={config}
                  tabIndex={1}
                  onChange={(newContent) => {
                    setContent(newContent) ; 
                    setFormData((prev) => ({
                      ...prev, 
                      blogContent: newContent
                    }))
                  }}
                />

                  {/* Word count + Validation feedback */}

                  <div className="flex justify-between items-center text-sm">
                    <span
                      className={isWordCountInvalid ? "text-destructive font-medium" : "text-muted-foreground"}
                    >
                      {wordCount} / 50 words 
                    </span>
                    {
                      isWordCountInvalid && (
                        <span className="text-red-500">
                          Blog content must be at least 50 words. 
                        </span>
                      )
                    }
                  </div>
              </div>
            </div>
            {loading ? (
              <ButtonSkeleton />
            ) : (
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitDisabled}
              >
                Submit
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddBlog;
