"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import React from "react";
import Link from "next/link";

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
              <Link href="/file-upload" className="hover:underline">
                Upload File
              </Link>
            </li>
            <li>
              <Link href="/my-files" className="hover:underline">
                My Files
              </Link>
            </li>
            {!isLoggedIn ? (
              <>
                <li>
                  <Link href="/register" className="hover:underline">
                    Register
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:underline">
                    Login
                  </Link>
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
