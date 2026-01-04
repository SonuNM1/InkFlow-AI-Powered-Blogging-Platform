"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";

// Creating a global store (Context) so any component in our app can access logged-in user data without passing props again and again.

// Service URLs

export const user_service = "http://localhost:5000";
export const author_service = "http://localhost:5001";
export const blog_service = "http://localhost:5002";

// User Interface - A TypeScript shape for user data. This lets TS know: "this is what a user looks like"

export interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  bio?: string;
}

// Blog interface - defines what a blog object looks like

export interface Blog {
  id: string;
  title: string;
  description: string;
  blogcontent: string;
  image: string;
  category: string;
  author: string;
  created_at: string;
}

interface SavedBlogType {
  id: string ; 
  userid: string ; 
  blogid: string ; 
  create_at : string 
}

// Context Type: Our global context will store: user -> either "User" object (logged in), null (logged out)

interface AppContextType {
  user: User | null ;
  loading: boolean ; 
  isAuth: boolean ; 
  setUser: React.Dispatch<React.SetStateAction<User | null>> ; 
  setLoading: React.Dispatch<React.SetStateAction<boolean>> ; 
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>> ; 
  logoutUser: () => Promise<void> ; 
  blogs: Blog[] | null; 
  blogLoading: boolean ; 
  setSearchQuery: React.Dispatch<React.SetStateAction<string>> ; 
  searchQuery: string ; 
  setCategory: React.Dispatch<React.SetStateAction<string>> ; 
  fetchBlogs: () => Promise<void> ; 
  savedBlogs: SavedBlogType[] | null ; 
  getSavedBlogs: () => Promise<void> ; 
  pagination: {
    totalCount: number ; 
    totalPages: number ; 
    currentPage: number ; 
    limit: number ; 
  } | null ; 
}


// createContext: It creates a global data container. It's a shared memory box for the whole app. "undefined" so React can warn us if: we try to use context outside the provider

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider props

interface AppProviderProps {
  children: ReactNode;
}

// This is a wrapper components: holds global state, exposes it to all children

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null); // state inside context
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  // Pagination state 

  const [page, setPage] = useState(1) ; 
  const [pagination, setPagination] = useState<any>(null) ; 

  async function fetchUser() {
    try {
      const token = Cookies.get("token");

      const { data } = await axios.get<User>(`${user_service}/api/v1/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(data);
      setIsAuth(true);
      setLoading(false);
    } catch (error) {
      console.log("Fetch user error: ", error);
      setLoading(false);
    }
  }

  const [blogLoading, setBlogLoading] = useState(true) ; 
  const [blogs, setBlogs] = useState<Blog[] | null>(null)

  const [category, setCategory] = useState("") ; 
  const [searchQuery, setSearchQuery] = useState("")

  // This will hold the debounced (delayed) search query 

  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("") ; 

  // Debounce search query to avoid API call on every keystroke 

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery) ; 
    }, 300);  // wait 300ms after user stops typing 

    // Cleanup timeout if user types again 

    return () => {
      clearTimeout(handler) ; 
    }
  },[searchQuery]) ; 

  async function fetchBlogs(){

    setBlogLoading(true) ; 
    try {
      
      const {data} = await axios.get(
        `${blog_service}/api/v1/blogs/all`, 
        {
          params: {
            searchQuery: debouncedSearchQuery,
            category, 
            page, // current page 
            limit: 16   // blogs per page 
          }
        }
      ) ; 

      setBlogs(data.blogs) ; // blogs only 
      setPagination(data.pagination) ; // pagination meta 
    } catch (error) {
      console.log("Fetch blog error: ", error) ; 
    } finally {
      setBlogLoading(false) ; 
    }
  }

  const [savedBlogs, setSavedBlogs] = useState<SavedBlogType[] | null>(null) ; 

  async function getSavedBlogs(){

    const token = Cookies.get("token") ; 

    if(!token) return ; 

    try {
      const {data} = await axios.get(
        `${blog_service}/api/v1/blog/saved/all`, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      setSavedBlogs(data) ; 
    } catch (error) {
      console.log("Get saved blog error: ", error)
    }
  }

  async function logoutUser(){
    Cookies.remove("token") ; 
    setUser(null) ; 
    setIsAuth(false) ; 

    toast.success("Logout successful.")
  }

  useEffect(() => {
    fetchUser();
    getSavedBlogs() ; 
  }, []);

  useEffect(() => {
    fetchBlogs()
  },[debouncedSearchQuery, category])

  return (
    <AppContext.Provider value={{
      user, 
      isAuth, 
      setIsAuth, 
      loading, 
      setLoading, 
      setUser, 
      logoutUser,
      blogs,
      blogLoading, 
      pagination, 
      page, 
      setPage, 
      setCategory, 
      setSearchQuery, 
      searchQuery, 
      fetchBlogs, 
      savedBlogs,
      getSavedBlogs
    }}>
      <GoogleOAuthProvider clientId="402233367112-tu1gba50m5ff25hn6r7a4783a7cqrda3.apps.googleusercontent.com">
        {children}
        <Toaster />
      </GoogleOAuthProvider>
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppData must be used within AppProvider");
  }

  return context;
};
