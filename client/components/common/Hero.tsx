import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { ArrowRight } from "lucide-react";

export default async function Hero() {
  const user = await currentUser();

  return (
    <main className=" flex flex-col items-center justify-center min-h-[520px] px-8 py-24 mt-10 md:mt-20">
      <div className="relative">
        <div className="flex flex-col justify-start max-w-xl lg:max-w-3xl">
          {/* Content */}

          <p className=" absolute lg:left-17 lg:-top-5 md:left-9 md:-top-3 hidden md:block text-[8px] lg:text-[12px] font-medium tracking-[0.12em] uppercase text-blue-400 ">
            Prysm
          </p>

          <div className="flex flex-col items-center gap-0 text-center">
            <p className="md:hidden text-[8px] lg:text-[12px] font-medium tracking-[0.12em] uppercase text-blue-400 mb-1">
              Prysm
            </p>
            <h1 className="font-sans text-4xl md:text-5xl lg:text-6xl font-normal  tracking-tight text-neutral-900 mb-1">
              Your documents.
              <em className=" text-yellow-300 not-italic font-serif">
                Finally understood.
              </em>
            </h1>

            {/* Subheadline */}
            <p className="mt-4 mb-6 md:mb-8 text-[11px] md:text-[15px] font-medium text-neutral-500 tracking-wide max-w-md">
              Prysm Reads, Understands and Answers. Citing the exact source
              every time.
            </p>

            <Show when="signed-out">
              <div className="flex gap-2">
                <Link href="/sign-in">
                  <button className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium p-2 w-16 md:w-18 rounded-md hover:text-neutral-700 transition-all duration-300 border border-neutral-700/10 text-[10px] md:text-sm">
                    Login
                  </button>
                </Link>
                <Link href="/sign-up">
                  <button className="bg-neutral-800 hover:bg-neutral-700 text-white font-medium p-2 w-18 md:w-22 rounded-md hover:text-neutral-100 transition-all duration-300 border border-neutral-700/10 text-[10px] md:text-sm">
                    Sign Up
                  </button>
                </Link>
              </div>
            </Show>

            <Show when="signed-in">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-2">
                <span className="text-[11px] md:text-[15px] font-medium tracking-wide text-neutral-600 text-center sm:text-left">
                  Hello {user?.firstName},{" "}
                  <span className="italic">Let's start working!</span>
                </span>
                <ArrowRight className="hidden sm:block size-4 text-neutral-400" />
                <Link href="/dashboard">
                  <div className="underline underline-offset-4 font-medium text-neutral-500 hover:text-neutral-800 transition-all duration-300 text-[10px] md:text-[12px] cursor-pointer">
                    Go To Dashboard
                  </div>
                </Link>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </main>
  );
}
