"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAppData, user_service } from "../context/AppContext";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Loading from "@/components/loading";
import { Camera, Facebook, Instagram, Linkedin } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

const ProfilePage = () => {
  const { user, setUser, logoutUser } = useAppData();

  const router = useRouter();

  // State Management 

  const [skeletonloading, setSkeletonLoading] = useState(true) ; // for skeleton loader
  const [open, setOpen] = useState(false); // edit modal 
  const [preview, setPreview] = useState<string | null>(null) ; // image preview 

  // form state 

  const [formData, setFormData] = useState({
    name: "",
    instagram: "",
    facebook: "",
    linkedin: "",
    bio: "",
  });

  // File input ref -> used to trigger hidden input 

  const fileInputRef = useRef<HTMLInputElement>(null) ; 

  // Auth guard 

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      // populate form when user loads 

      setFormData({
        name: user.name || "", 
        bio: user.bio || "", 
        instagram: user.instagram || "", 
        facebook: user.facebook || "", 
        linkedin: user.linkedin || ""
      }) ; 
      setSkeletonLoading(false) ; 
    }
  }, [user, router]);

  // Avatar click handler 

  const handleAvatarClick = () => {
    fileInputRef.current?.click() ; 
  }

  // Image change handler - creates preview, uploads image 

  const handleImageChange = async (e:any) => {

    const file = e.target.files[0] ; 
    if(!file) return ; 

    // preview image instantly 

    setPreview(URL.createObjectURL(file)) ; 

    const data = new FormData() ; 
    data.append("file", file) ; 

    try {
      const token = Cookies.get("token") ; 

      const res = await axios.post(
        `${user_service}/api/v1/user/update/pic`, 
        data, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      toast.success("Profile image updated") ; 

      Cookies.set("token", res.data.token) ; 
      setUser(res.data.user) ; 
      setPreview(null) ; 
    } catch (error) {
      console.error("Image change error: ", error) ; 
      toast.error("Image upload failed.")
    }

  }

  // Profile update handler 

  const handleSave = async () => {
    try {
      const token = Cookies.get("token") ; 

      const res = await axios.post(
        `${user_service}/api/v1/user/update`,
        formData, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      toast.success("Profile updated") ; 
      Cookies.set("token", res.data.token) ; 

      setUser(res.data.user) ; 
      setOpen(false) ; 
    } catch (error) {
      console.error("Handle save error: ", error) ; 
      toast.error("Update failed") ; 
    }
  }

  const logoutHandler = () => {
    logoutUser();
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md p-6 rounded-2xl">

        {/* Avatar */}

        <div className="relative w-fit mx-auto cursor-pointer" onClick={handleAvatarClick}>
          <Avatar className="w-28 h-28">
            <AvatarImage src={preview || user?.image}/>
          </Avatar>

          {/* Camera icon overlay */}

          <div className="absolute bottom-1 right-1 bg-black text-white p-1 rounded-full">
            <Camera size={16}/>
          </div>

          <input
            type="file"
            hidden
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
        </div>

        {/* Name & Bio */}

        <div className="text-center mt-4 space-y-1">
          <h2 className="text-xl font-semibold">
            {user?.name}
          </h2>
          {
            user?.bio && <p className="text-sm text-muted-foreground">
              {user.bio}
            </p>
          }
        </div>

        {/* Social Links */}

        <div className="flex justify-center gap-4 mt-4">
          {
            user?.instagram && (
              <a href={user.instagram} target="_blank">
                <Instagram/>
              </a>
            )
          }
          {
            user?.facebook && (
              <a href={user.facebook} target="_blank">
                <Facebook/>
              </a>
            )
          }
          {
            user?.linkedin && (
              <a href={user.linkedin} target="_blank">
                <Linkedin/>
              </a>
            )
          }
        </div>

        {/* Actions */}

        <div className="flex gap-2 mt-6">
          <Button
            variant="outline"
            onClick={()=> setOpen(true)}
          >
            Edit 
          </Button>
          <Button
            onClick={()=> router.push("/blog/new")}
          >
            Add Blog  
          </Button>
          <Button
            variant="destructive"
            onClick={logoutUser}
          >
            Logout 
          </Button>
        </div>
      </Card>

      {/* Edit modal */}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Profile 
            </DialogTitle>
          </DialogHeader>

            {
              Object.entries(formData).map(([Key, value]) => (
                <div key={key}>
                    <Label className="capitalize">
                      {key}
                    </Label>
                    <Input
                      value={value}
                      onChange={(e) => setFormData({
                        ...formData, 
                        [key]: e.target.value 
                      })}
                    />
                </div>
              ))
            }

            <Button className="mt-4" onClick={handleSave}>
              Save Changes 
            </Button>

        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ProfilePage;
