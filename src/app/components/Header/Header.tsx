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
    <header className="neu w-[90%] md:w-2/3 fixed left-1/2 transform -translate-x-1/2 top-4 text-blue-950 px-4 py-4 rounded-3xl">
      <div className="flex justify-between items-center container mx-auto">
        <h1
          className="text-3xl font-bold cursor-pointer"
          onClick={() => router.push("/")}
        >
          Uppy
        </h1>
        <nav>
          <ul className="flex gap-4 items-center">
            <li>
              <Link href="/file-upload">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#172554"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-4M17 8l-5-5-5 5M12 4.2v10.3" />
                </svg>
              </Link>
            </li>
            <li>
              <Link href="/my-files">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#172554"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M13 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V9l-7-7z" />
                  <path d="M13 3v6h6" />
                </svg>
              </Link>
            </li>
            {!isLoggedIn ? (
              <>
                <li>
                  <Link href="/register">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#172554"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="8.5" cy="7" r="4"></circle>
                      <line x1="20" y1="8" x2="20" y2="14"></line>
                      <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>
                  </Link>
                </li>
                <li>
                  <Link href="/login">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#172554"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3" />
                    </svg>
                  </Link>
                </li>
              </>
            ) : (
              <li className="flex">
                <button onClick={handleLogout}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#172554"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M16 17l5-5-5-5M19.8 12H9M13 22a10 10 0 1 1 0-20" />
                  </svg>
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
