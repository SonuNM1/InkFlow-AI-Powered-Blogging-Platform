"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, LogIn, CircleUserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppData } from "@/app/context/AppContext";
import {motion, AnimatePresence} from "framer-motion"
import { ThemeToggle } from "./theme-toggle";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { loading, isAuth } = useAppData();

  return (
    <header className="sticky top-0 z-50 bg-background/80  backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <Link
          href="/blogs"
          className="text-xl font-semibold text-foreground"
        >
          InkFlow
        </Link>

        {/* Desktop Navigation */}

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground hover:text-foreground transition">
          <Link href="/blogs" className="hover:text-black transition">
            Home
          </Link>
          <Link href="/blog/saved" className="hover:text-black transition">
            Saved
          </Link>
        </nav>

        {/* Desktop Auth */}

        <div className="hidden md:flex items-center gap-2">

          <ThemeToggle/>

          {!loading && (
            isAuth ? (
              <Link href="/profile">
                <Button variant="ghost" size="icon">
                  <CircleUserRound className="w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
            )
          )}
        </div>

        {/* Mobile Menu Button */}

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile Menu */}
      
      <AnimatePresence>
        {
          open && (
            <motion.div
              initial={{opacity: 0, y: -8}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -8}}
              transition={{duration: 0.2, ease: "easeOut"}}
              className="md:hidden border-t bg-background"
            >
              <div className="flex flex-col gap-4 px-6 py-6 text-sm">
                <Link href="/blogs" onClick={() => setOpen(false)}>
                  Home 
                </Link>
                <Link href="/blog/saved" onClick={() => setOpen(false)}>
                  Saved 
                </Link>
                {
                  !loading && (
                    isAuth ? (
                      <Link href="/profile" onClick={() => setOpen(false)}>
                        Profile 
                      </Link>
                    ) : (
                      <Link href="/login" onClick={() => setOpen(false)}>
                        <Button className="w-full">
                          <LogIn className="w-4 h-4 mr-2"/>
                        </Button>
                      </Link>
                    )
                  )
                }
              </div>
            </motion.div>
          )
        }
      </AnimatePresence>

    </header>
  );
};

export default Navbar;
