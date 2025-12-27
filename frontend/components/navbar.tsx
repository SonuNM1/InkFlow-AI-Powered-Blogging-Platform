"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, CircleUserRoundIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppData } from "@/app/context/AppContext";

/*
  Navbar is a CLIENT COMPONENT because:
  - It uses useState
  - It handles click events
*/

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // mobile menu toggle

  const { loading, isAuth } = useAppData();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b">
      {/* Main navbar container */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/blogs" className="text-2xl font-bold text-gray-900">
          InkFlow
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/blogs" className="hover:text-blue-600 transition">
            Home
          </Link>

          <Link href="/blog/saved" className="hover:text-blue-600 transition">
            Saved
          </Link>

          {loading ? (
            ""
          ) : (
            <li>
              {isAuth ? (
                <Link href={"/profile"} className="hover:text-blue-500">
                  <CircleUserRoundIcon />
                </Link>
              ) : (
                <Link href={"/login"} className="hover:text-blue-500">
                  <LogIn />
                </Link>
              )}
            </li>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300",
          isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="flex flex-col items-center gap-4 py-4 bg-white border-t">
          <Link href="/" onClick={() => setIsOpen(false)}>
            Home
          </Link>

          <Link href="/blog/saved" onClick={() => setIsOpen(false)}>
            Saved
          </Link>

          <Link href="/login" onClick={() => setIsOpen(false)}>
            <Button className="w-40">
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
