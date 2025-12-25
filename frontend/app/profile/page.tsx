"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAppData, user_service } from "../context/AppContext";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Loading from "@/components/loading";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {useRouter } from "next/navigation";

const ProfilePage = () => {
    
  const { user, setUser, logoutUser } = useAppData();

  const router = useRouter() ; 

  useEffect(() => {
    if(!user){
        router.push("/login")
    }
  }, [user, router])
 
  const logoutHandler = () => {
    logoutUser() ; 
  }

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false) ; 
  const [formData, setFormData] = useState({
    name: user?.name || "",
    instagram: user?.instagram || "", 
    facebook: user?.facebook || "", 
    linkedin: user?.linkedin || "", 
    bio: user?.bio || ""
  })

  // Creates a reference to a real DOM element. Does NOT cause re-renders. Used when you want to: click, focus, read files, access native DOM methods

  const InputRef = useRef<HTMLInputElement>(null);

  //  User clicks avatar. We programmatically click the hidden file input. Browser opens file picker. 

  const clickHandler = () => {
    InputRef.current?.click();
  };

  // User selects image. File is extracted. Stored in "FormData" (required for file uploads)

  const changeHandler = async (e: any) => {
    const file = e.target.files[0];

    if (file) {
      const formData = new FormData();

      formData.append("file", file);

      try {
        setLoading(true);

        const token = Cookies.get("token");

        const { data } = await axios.post(
          `${user_service}/api/v1/user/update/pic`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success(data.message);

        Cookies.set("token", data?.token, {
          expires: 5,
          secure: true,
          path: "/",
        });

        setUser(data.user);
        setLoading(false);
      } catch (error) {
        toast.error("Image update failed.");
        setLoading(false);
        console.log("Profile page error: ", error);
      }
    }
  };

  const handleFormSubmit = async() => {
    try{
        setLoading(true) ; 
        const token = Cookies.get("token") ; 

        const {data} = await axios.post(
            `${user_service}/api/v1/user/update`, 
            formData, 
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

        toast.success(data.message) ; 
        setLoading(false) ; 

        Cookies.set("token", data.token, {
            expires: 5,
            secure: true,
             path: "/"
        }) ; 

        setUser(data.user) ; 
        setOpen(false) ; 
    }catch(error){
        toast.error("Update failed") ;
        setLoading(false) ; 

        console.log("Handle form submit error: ", error)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      {loading ? (
        <Loading />
      ) : (
        <Card className="w-full max-w-xl shadow-lg border rounded-2xl p-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex-col items-center space-y-4">
              <Avatar
                className="w-28 h-28 border-4 border-gray-200 shadow-md cursor-pointer"
                onClick={clickHandler}
              >
                <AvatarImage src={user?.image} alt="Profile image" />
              </Avatar>

              <input
                type="file"
                className="hidden"
                accept="image/*"
                ref={InputRef}
                onChange={changeHandler}
              />

              <div className="w-full space-y-2 text-center">
                <label className="font-medium">Name</label>
                <p>{user?.name}</p>
              </div>
              {user?.bio && (
                <div className="w-full space-y-2 text-center">
                  <label className="font-medium">Bio</label>
                  <p>{user.bio}</p>
                </div>
              )}

              <div className="flex gap-4 mt-3">
                {user?.instagram && (
                  <a
                    href={user.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="text-pink-500 text-2xl" />
                  </a>
                )}
                {user?.facebook && (
                  <a
                    href={user.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Facebook className="text-blue-500 text-2xl" />
                  </a>
                )}
                {user?.linkedin && (
                  <a
                    href={user.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="text-blue-700 text-2xl" />
                  </a>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-6 w-full justify-center">
                <Button onClick={logoutHandler}>
                    Logout
                </Button>
                <Button
                    onClick={() => router.push("/blog/new")}
                >
                    Add Blog
                </Button>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button variant={"outline"}>
                            Edit 
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>
                                Edit Profile
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                            <div>
                                <Label>Name</Label>
                                <Input value={formData.name} onChange={e => setFormData({
                                    ...formData, 
                                    name: e.target.value
                                })} />
                            </div>
                            <div>
                                <Label>Bio</Label>
                                <Input value={formData.bio} onChange={e => setFormData({
                                    ...formData, 
                                    bio: e.target.value
                                })} />
                            </div>
                            <div>
                                <Label>Instagram</Label>
                                <Input value={formData.instagram} onChange={e => setFormData({
                                    ...formData, 
                                    instagram: e.target.value
                                })} />
                            </div>
                            <div>
                                <Label>Facebook</Label>
                                <Input value={formData.facebook} onChange={e => setFormData({
                                    ...formData, 
                                    facebook: e.target.value
                                })} />
                            </div>
                            <div>
                                <Label>LinkedIn</Label>
                                <Input value={formData.linkedin} onChange={e => setFormData({
                                    ...formData, 
                                    linkedin: e.target.value
                                })} />
                            </div>
                                <Button onClick={handleFormSubmit} className="w-full mt-4">
                                    Save Changes 
                                </Button>
                        </div>
                    </DialogContent>
                </Dialog>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default ProfilePage;
