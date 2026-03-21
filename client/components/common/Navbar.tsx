"use client";
import Link from "next/link";

import { useState } from "react";
import { Show, SignOutButton, UserButton } from "@clerk/nextjs";
import { Container } from "./Container";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass =
    "border-l dark:border-neutral-500/70 border-neutral-300 last:border-r px-4 py-4 text-neutral-800   hover:bg-neutral-800 hover:text-neutral-200 transition-colors duration-300";

  const mobileLinkClass =
    "w-full text-center px-6 py-4 text-neutral-800   hover:bg-neutral-800 hover:text-neutral-200 transition-colors duration-300   border-neutral-300";

  return (
    <>
      <div className="sticky top-0 z-50 border-b border-neutral-300  bg-white ">
        <Container>
          <div className="flex justify-end md:justify-between h-15">
            {/* Desktop Nav */}
            <Show when="signed-in">
              <div className="hidden md:flex border-l border-r  border-neutral-300 last:border-r px-4 py-4 text-neutral-800  hover:bg-neutral-800 hover:text-neutral-200 transition-colors duration-300">
                <UserButton />
              </div>
            </Show>
            <Show when="signed-out">
              <div></div>
            </Show>

            <div className="hidden md:flex">
              <Show when="signed-in">
                <div className={linkClass}>
                  <span className="text-sm">
                    <SignOutButton />
                  </span>
                </div>
              </Show>

              <Show when="signed-out">
                <Link href="/sign-in" className={linkClass}>
                  <span className="text-sm">Login</span>
                </Link>
                <Link href="/sign-up" className={linkClass}>
                  <span className="text-sm">Signup</span>
                </Link>
              </Show>
            </div>
            <div className="flex md:hidden items-center">
              <button
                className="border-l border-r  border-neutral-300 flex items-center px-4 py-4 text-neutral-800  hover:bg-neutral-800 hover:text-neutral-200 transition-colors duration-300"
                onClick={() => setMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white md:hidden">
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 p-2 text-neutral-800  hover:bg-neutral-100 rounded transition-colors duration-300"
            onClick={() => setMenuOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>

          <div className="flex flex-col items-center w-full  border-neutral-300">
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className={mobileLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                <span className="text-sm">
                  <SignOutButton />
                </span>
              </Link>

              <div className="w-full flex justify-center px-6 py-4   border-neutral-300">
                <UserButton />
              </div>
            </Show>

            <Show when="signed-out">
              <Link
                href="/sign-in"
                className={mobileLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                <span className="text-sm">Login</span>
              </Link>
              <Link
                href="/sign-up"
                className={mobileLinkClass}
                onClick={() => setMenuOpen(false)}
              >
                <span className="text-sm">Signup</span>
              </Link>
            </Show>
          </div>
        </div>
      )}
    </>
  );
}
