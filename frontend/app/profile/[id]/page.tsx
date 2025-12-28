"use client"

"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAppData, User, user_service } from "@/app/context/AppContext";
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
import {useParams, useRouter } from "next/navigation";

const UserProfilePage = () => {

    const [user, setUser] = useState<User | null>(null)

    const {id} = useParams() ; 

    async function fetchUser(){
        try {
            const {data} = await axios.get(
                `${user_service}/api/v1/user/${id}`
            ) ; 

            setUser(data) ; 
        } catch (error) {
            console.log("Fetch user error: ", error)
        }
    }

    useEffect(() => {
        fetchUser() ;
    }, [id])

    if(!user){
        return <Loading/>
    }

  return <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-xl shadow-lg border rounded-2xl p-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex-col items-center space-y-4">
              <Avatar
                className="w-28 h-28 border-4 border-gray-200 shadow-md cursor-pointer"
              >
                <AvatarImage src={user?.image} alt="Profile image" />
              </Avatar>

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
            </CardTitle>
          </CardHeader>
        </Card>
    </div>;
};

export default UserProfilePage;
