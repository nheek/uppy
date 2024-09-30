"use client"; // Ensure this is included

import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation"; // Use next/navigation for client components

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    setIsAuthenticated(false);
    router.push("/"); // Redirect to homepage
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl mb-4">Welcome to File Hosting</h1>

      {isAuthenticated ? (
        <>
          <p className="mb-4">You are logged in!</p>
          <div>
            <Link href="/file-upload" className="text-blue-500 mr-4">
              Upload Files
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white p-2 rounded"
            >
              Logout
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mb-4">You are not logged in.</p>
          <div>
            <Link href="/login" className="text-blue-500 mr-4">
              Login
            </Link>
            <Link href="/register" className="text-blue-500">
              Register
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
