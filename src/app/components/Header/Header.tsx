"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import React from "react";

const Header = () => {
  const router = useRouter();
  const isLoggedIn = Cookies.get("token");
  const handleLogout = () => {
    Cookies.remove("token");
    router.push("/login");
  };

  return (
    <header className="bg-blue-600 text-white px-4 py-2">
      <div className="flex justify-between items-center container mx-auto">
        <h1
          className="text-3xl font-bold cursor-pointer"
          onClick={() => router.push("/")}
        >
          Uppy
        </h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <a href="/file-upload" className="hover:underline">
                Upload File
              </a>
            </li>
            <li>
              <a href="/my-files" className="hover:underline">
                My Files
              </a>
            </li>
            {!isLoggedIn ? (
              <>
                <li>
                  <a href="/register" className="hover:underline">
                    Register
                  </a>
                </li>
                <li>
                  <a href="/login" className="hover:underline">
                    Login
                  </a>
                </li>
              </>
            ) : (
              <li>
                <button onClick={handleLogout} className="hover:underline">
                  Logout
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
