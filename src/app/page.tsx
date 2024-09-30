"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");  // Get the token from the cookie
    setIsAuthenticated(!!token);         // Check if the token exists
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl mb-4">Welcome to File Hosting</h1>
      {isAuthenticated ? (
        <p className="mb-4">You are logged in!</p>
      ) : (
        <p className="mb-4">You are not logged in.</p>
      )}
      <div>
        <Link href="/login" className="text-blue-500 mr-4">Login</Link>
        <Link href="/register" className="text-blue-500">Register</Link>
      </div>
    </div>
  );
};

export default Home;
