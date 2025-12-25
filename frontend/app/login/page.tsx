"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppData, user_service } from "../context/AppContext";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import {useGoogleLogin} from "@react-oauth/google"
import { redirect } from "next/navigation";
import Loading from "@/components/loading";
import axios from "axios";

/*
  Login page is a CLIENT COMPONENT because:
  - It handles user interaction (click login)
*/

interface LoginResponse {
  token: string, 
  user: {
    _id: string; 
    name: string; 
    email: string; 
    image: string; 
  };
  message: string 
}

const LoginPage = () => {

  const {isAuth, setIsAuth, loading, setLoading, setUser} = useAppData() ; 

  if(isAuth) return redirect("/") ; 

  const responseGoogle = async(authResult: any) => {
    try{

      setLoading(true) ; 

      const result = await axios.post<LoginResponse>(`${user_service}/api/v1/login`, {
        code: authResult["code"] || authResult.code 
      })

      Cookies.set("token", result.data.token, {
        expires: 5,
        secure: true, 
        path: "/"
      }) ; 

      toast.success(result.data.message) ; 
      setIsAuth(true) ; 
      setLoading(false) ; 
      setUser(result.data.user)
    }catch(error){
      console.log("Login error: ", error)
      toast.error("Problem while login you.")

      setLoading(false) ; 
    }
  }

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: responseGoogle, 
    onError: responseGoogle
  })

  return (
    <>
      {loading ? (
        <Loading/>
      ) : (<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      {/* Login Card */}
      <Card className="w-full max-w-md shadow-lg">

        {/* Header */}
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Welcome to InkFlow
          </CardTitle>
          <CardDescription>
            AI-Powered Blogging Platform
          </CardDescription>
        </CardHeader>

        {/* Content */}
        <CardContent className="flex flex-col gap-4">

          {/* Google Login Button */}

          <Button
            variant="outline"
            className="flex items-center gap-3 justify-center"
            onClick={googleLogin}
          >
            <img
              src="/google.png"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </Button>

          {/* Small text */}
          <p className="text-sm text-gray-500 text-center">
            By continuing, you agree to our Terms & Privacy Policy
          </p>

        </CardContent>
      </Card>
    </div>)}
    </>
  );
};

export default LoginPage;
