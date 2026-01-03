"use client" ;

import { createContext, useContext, useState } from "react";
 
// Centralized state to control AI-related UI (quota modal, future flags). Keeps AI logic out of pages (SRP-friendly)

interface AIContextType {
    showQuotaModal: boolean ; // whether quota modal is visible 
    openQuotaModal: () => void ; // show modal 
    closeQuotaModal: () => void ;   // hide modal  
}

const AIContext = createContext<AIContextType | null>(null) ; 

export const AIProvider = ({children} : {children: React.ReactNode}) => {

    // Tracks if AI quota modal should be shown 

    const [showQuotaModal, setShowQuotaModal] = useState(false) ; 

    return (
        <AIContext.Provider
            value={{
                showQuotaModal, 
                openQuotaModal: () => setShowQuotaModal(true), 
                closeQuotaModal: () => setShowQuotaModal(false)
            }}
        >
            {children}
        </AIContext.Provider>
    )
}

// Custom hook to safely consume AIContext. 

export const useAIContext = () => {
    const ctx = useContext(AIContext) ; 

    if(!ctx){
        throw new Error("useAIContext must be used inside AIProvider") ; 
    }
    return ctx ; 
}