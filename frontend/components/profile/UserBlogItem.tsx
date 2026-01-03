"use client"

import React from 'react'
import { Card } from '../ui/card'
import { useRouter } from 'next/navigation'

const UserBlogItem = ({blog}: {blog:any}) => {

    const router = useRouter() ; 

  return (
    <Card 
        onClick={() => router.push(`/blog/${blog.id}`)}
        className='p-4 flex gap-4 cursor-pointer hover:shadow-md transition'
    >
      <img
        src={blog.image}
        alt={blog.title}
        className='w-24 h-20 object-cover rounded-md flex-shrink-0'
      />

    {/* Text Container */}

    <div className='flex flex-col justify-center'>
        <h4 className='font-semibold line-clamp-1'>
            {blog.title}
        </h4>
        <p className='text-sm text-muted-foreground line-clamp-2'>
            {blog.description}
        </p>
    </div>

    </Card>
  )
}

export default UserBlogItem
