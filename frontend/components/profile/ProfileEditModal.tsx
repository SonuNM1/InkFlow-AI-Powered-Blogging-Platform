"use client" ; 

import { useAppData, user_service } from '@/app/context/AppContext';
import React, { useState } from 'react'
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import axios from 'axios';

interface UpdateUserResponse {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    image: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    bio?: string;
  }
}


// handles profile update form 

const ProfileEditModal = ({
    open, 
    onClose 
}: {
    open: boolean; 
    onClose: () => void 
}) => {

    const {user, setUser} = useAppData() ; 

    const [formData, setFormData] = useState({
        name: user?.name || "", 
        bio: user?.bio || "", 
        instagram: user?.instagram || "", 
        facebook: user?.facebook || "", 
        linkedin: user?.linkedin || ""
    })

    const handleSave = async () => {
        try {
            const token = Cookies.get('token') ; 

            const res = await axios.post<UpdateUserResponse>(
                `${user_service}/api/v1/user/update`, 
                formData, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            ) ; 

            toast.success("Profile updated") ; 
            Cookies.set("token", res.data?.token) ; 
            setUser(res.data?.user) ; 

            onClose() ; 
        } catch (error) {
            toast.error("Update failed")
        }
    }

  return (
    <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    Edit Profile 
                </DialogTitle>
            </DialogHeader>

            {
                Object.entries(formData).map(([key,value]) => (
                    <div key={key}>
                        <Label className='capitalize'>
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
            <Button
                onClick={handleSave}
                className='mt-4'
            >
                Save Changes 
            </Button>
        </DialogContent>
    </Dialog>
  )
}

export default ProfileEditModal
