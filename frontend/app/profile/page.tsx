"use client" ; 

import React, { useEffect, useState } from 'react'
import { author_service, useAppData } from '../context/AppContext';
import { useRouter } from 'next/navigation';
import UserBlogs from '@/components/profile/UserBlogs';
import Cookies from 'js-cookie';
import ProfileHeader from '@/components/profile/ProfileHeader';
import axios from 'axios';

const ProfilePage = () => {

  const {user} = useAppData() ; 
  const router = useRouter() ; 

  const [myBlogs, setMyBlogs] = useState([]) ; 
  const [loading, setLoading] = useState(true) ; 

  // auth guard 

  useEffect(() => {
    if(!user) router.push("/login") ; 
  }, [user])

  // fetch blogs 

  useEffect(() => {
    if(!user) return ; 
    
    const fetchMyBlogs = async () => {
      try {
        const token = Cookies.get("token") ; 

        const res = await axios.get(
          `${author_service}/api/v1/my`, 
          {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          }
        ) ; 

        setMyBlogs(res.data.blogs || []) ; 
      } catch (error) {
        console.log("Failed to fetch user blogs: ", error) ; 
      } finally {
        setLoading(false) ; 
      }
    } ; 

    fetchMyBlogs() ;
  }, [user])
 
  return (
    <div className='grid gap-6 p-4 md:grid-cols-[30%_70%] md:p-6'>

      {/* LEFT: profile info */}

      <ProfileHeader/>

      {/* RIGHT: create blog + blog list */}

      <UserBlogs blogs={myBlogs} loading={loading} />
    </div>
  )
}

export default ProfilePage
