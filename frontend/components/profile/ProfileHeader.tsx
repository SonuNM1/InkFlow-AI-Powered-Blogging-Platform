"use client";

import { useAppData } from "@/app/context/AppContext";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Instagram, Facebook, Linkedin, Camera } from "lucide-react";
import React, { useRef, useState } from "react";
import ProfileEditModal from "./ProfileEditModal";

/**
 * ProfileHeader
 * -------------
 * Clean profile section (no card).
 * Shows image, name, bio, socials, and actions.
 */

const ProfileHeader = () => {
  const { user, logoutUser } = useAppData();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // controls edit modal visibility

  const [openEdit, setOpenEdit] = useState(false);

  return (
    <div className="space-y-6">

      {/* IMAGE + BASIC INFO */}
      
      <div className="flex items-center gap-6">
        
        {/* Avatar */}
        
        <div
          className="relative cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Avatar className="w-24 h-24 ring-2 ring-muted">
            <AvatarImage src={preview || user?.image} />
          </Avatar>

          <div className="absolute bottom-1 right-1 bg-primary text-primary-foreground p-1 rounded-full">
            <Camera size={14} />
          </div>

          {/* hidden file input */}

          <input type="file" hidden ref={fileInputRef} />
        </div>

        {/* Name + Bio */}

        <div>
          <h2 className="text-2xl font-semibold">{user?.name}</h2>
          {user?.bio && (
            <p className="text-sm text-muted-foreground mt-1">{user.bio}</p>
          )}
        </div>
      </div>

      {/* SOCIAL + Action row */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:flex-col md:items-start md:justify-start md:mt-12">

        {/* Social links (left) */}

        <div className="flex gap-4">
          {user?.instagram && (
            <a href={user.instagram} target="_blank">
              <Instagram className="text-pink-600" />
            </a>
          )}
          {user?.facebook && (
            <a href={user.facebook} target="_blank">
              <Facebook className="text-blue-600" />
            </a>
          )}
          {user?.linkedin && (
            <a href={user.linkedin} target="_blank">
              <Linkedin className="text-blue-700" />
            </a>
          )}
        </div>

        {/* Action Buttons - Right */}

          <div className="flex gap-3 md:mt-10">
            <Button
                variant="outline"
                onClick={() => setOpenEdit(true)}
            >
                Edit Profile 
            </Button>
            <Button
                variant="destructive"
                onClick={logoutUser}
            >
                Logout 
            </Button>
          </div>

      </div>

      {/* EDIT MODAL */}

      <ProfileEditModal open={openEdit} onClose={() => setOpenEdit(false)} />
    </div>
  );
};

export default ProfileHeader;
