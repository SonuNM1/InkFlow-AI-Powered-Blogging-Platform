"use client"

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Input } from "./ui/input";
import { BoxSelect } from "lucide-react";
import { blogCategories } from "@/app/blog/new/page";
import { useAppData } from "@/app/context/AppContext";

const SideBar = () => {

    const {
      searchQuery, 
      setSearchQuery, 
      setCategory, 
      category
    } = useAppData() ; 

  return (
    <Sidebar>
      <SidebarHeader className="bg-white text-2xl font-bold mt-5">
        InkFlow
      </SidebarHeader>
      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupLabel>Search</SidebarGroupLabel>
          <Input 
            type="text" placeholder="Search your desired blog"
            value={searchQuery}
            onChange={e=> setSearchQuery(e.target.value)}
          />
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setCategory("")}
                className={
                  `flex items-center gap-2 ${category === "" ? "bg-gray-200 dark:bg-gray-700" : ""}`
                }
              >
                
                {/* Checkbox visual */}

                <span className="w-4 h-4 border rounded flex items-center justify-center">
                  {
                    category === "" && "✓"
                  }
                </span>
                <span>
                  All
                </span>
                <BoxSelect />
                <span>All</span>
              </SidebarMenuButton>
              {blogCategories?.map((e, i) => {

                const isActive = category === e ; // check if this category is selected 

                return (
                  <SidebarMenuButton    key={i}
                   onClick={() => setCategory(e)}
                   className={`
                      flex items-center gap-2 transition-colors ${isActive ? "bg-gray-200 dark:bg-gray-700" : ""}
                    `}
                  >
                    <span className="w-4 h-4 border rounded flex items-center justify-center text-xs font-bold">
                      {
                        isActive && "✓"
                      }
                    </span>
                    <span>{e}</span>
                  </SidebarMenuButton>
                );
              })}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default SideBar;
