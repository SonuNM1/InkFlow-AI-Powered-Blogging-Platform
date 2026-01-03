"use client";

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
    category, // currently selected category
  } = useAppData();

  return (
    <Sidebar>
      <SidebarHeader className="bg-white text-2xl font-bold mt-5">
        InkFlow
      </SidebarHeader>

      <SidebarContent className="bg-white">
        <SidebarGroup>

          {/* SEARCH */}
          <SidebarGroupLabel>Search</SidebarGroupLabel>
          <Input
            type="text"
            placeholder="Search your desired blog"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* CATEGORIES */}
          <SidebarGroupLabel>Categories</SidebarGroupLabel>

          <SidebarMenu>

            {/* ---------- ALL CATEGORY ---------- */}

            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setCategory("")}
                className={`
                    flex items-center gap-3 ${category === "" ? "bg-gray-200 dark:bg-gray-700 font-medium" : ""}
                  `}
              >

                {/* Custom checkbox */}

                <span
                  className={`
                      w-4 h-4 border rounded flex items-center justify-center text-xs font-bold ${category === "" ? "bg-black text-white border-black" : "border-gray-400"}
                    `}
                >
                  {
                    category === "" && "✓"
                  }
                </span>
                <span>
                  All 
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* ---------- DYNAMIC CATEGORIES ---------- */}
            
            {blogCategories.map((cat, i) => {
              const isActive = category === cat;

              return (
                <SidebarMenuItem key={i}>
                  <SidebarMenuButton
                    onClick={() => setCategory(cat)}
                    className={`
                      flex items-center gap-2 transition-colors
                      ${isActive ? "bg-gray-200 dark:bg-gray-700" : ""}
                    `}
                  >
                    {/* Checkbox */}
                    <span
                      className={`
                          w-4 h-4 border rounded flex items-center justify-center text-xs font-bold ${isActive ? "bg-black text-white border-black" : "border-gray-400"}
                        `}
                    >
                      {isActive && "✓"}
                    </span>
                    <span>{cat}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>

        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default SideBar;
