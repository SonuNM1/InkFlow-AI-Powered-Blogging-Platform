"use client" ; 

import React from 'react'
import { Button } from './ui/button';

// Stateless UI component. SRP: Only renders pagination controls

const Pagination = ({pagination, onPageChange}: any) => {

    if(!pagination || pagination.totalPages <= 1) return null ; 

    const {currentPage, totalPages} = pagination ; 

  return (
    <div className='flex justify-center items-center gap-2 mt-8'>
      
        {/* Previous */}

        <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
        >
            Prev 
        </Button>

        {/* Page Numbers */}

        {
            Array.from({length: totalPages}).map((_, i) => {
                const page = i + 1 ;
                return (
                    <Button
                        key={page}
                        size="sm"
                        variant={page === currentPage ? "default" : "outline"}
                        onClick={()=> onPageChange(page)}
                    >
                        {page}
                    </Button>
                )
             })
        }

        {/* Next */}

        <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={()=>onPageChange(currentPage + 1)}
        >
            Next 
        </Button>

    </div>
  )
}

export default Pagination
