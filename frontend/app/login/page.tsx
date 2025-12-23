"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/*
  Login page is a CLIENT COMPONENT because:
  - It handles user interaction (click login)
*/

const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

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
    </div>
  );
};

export default LoginPage;
