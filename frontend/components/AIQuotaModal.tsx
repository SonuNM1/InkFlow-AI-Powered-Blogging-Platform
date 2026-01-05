"use client" ; 

import { useAIContext } from '@/app/context/AIContext'
import React from 'react'
import { Button } from './ui/button';

const AIQuotaModal = () => {

    const {showQuotaModal, closeQuotaModal} = useAIContext() ; 

    if(!showQuotaModal) return null ; // don't render anything unless quota is exceeded 

  return (
    <div className='fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center'>
      <div className='bg-card text-card-foreground rounded-lg max-w-md w-full p-6 space-y-4 shadow-lg'>
        <h2 className='text-xl font-semibold'>
            AI Usage Limit Reached 
        </h2>

        {/* Clear explanation instead of vague error */}

        <p className='text-sm text-muted-foreground'>
            This AI feature uses <strong>real paid API</strong>. To control costs, usage is intentionally limited. 
        </p>

        {/* Recruiter friendly CTA */}

        <p className='text-sm text-gray-600'>
            If you'd like extended acccess for evaluation, feel free to contact me: 
        </p>

        <div className='text-sm font-medium text-foreground'>
           📧 isonumahto362000@gmail.com 
            📞 +91-7903648044
        </div>

        <div className='flex justify-end'>
            <Button onClick={closeQuotaModal}>
                Got it 
            </Button>
        </div>

      </div>
    </div>
  )
}

export default AIQuotaModal


// Shown when AI usage limit is reached. Explains why the feature is limited (real API cost). Acts as transparent communication to recruiters/users