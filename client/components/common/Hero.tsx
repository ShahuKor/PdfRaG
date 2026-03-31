import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export default async function Hero() {
  const user = await currentUser();
  return (
    <main className="flex items-center justify-center px-8 ">
      <div className="flex flex-col gap-8 items-center ">
        <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-6xl font-semibold tracking-tight text-neutral-800">
          Chat With PDF
        </h1>

        <Show when="signed-out">
          <div className="flex gap-2">
            <Link href="/sign-in">
              <button className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium p-2 w-18 rounded-md hover:text-neutral-700 transition-all duration-300 border border-neutral-700/10 text-sm">
                Login
              </button>
            </Link>
            <Link href="/sign-up">
              <button className="bg-neutral-800 hover:bg-neutral-700 text-white font-medium p-2 w-22 rounded-md hover:text-neutral-100 transition-all duration-300 border border-neutral-700/10 text-sm">
                Sign Up
              </button>
            </Link>
          </div>
        </Show>

        <Show when="signed-in">
          <div className="flex flex-col gap-4">
            <span className="text-xl font-medium tracking-wide ">
              Hello, {user?.firstName}
            </span>
            <Link href="/dashboard">
              <button className="bg-neutral-800 hover:bg-neutral-700 text-white font-medium p-2 w-35 rounded-md hover:text-neutral-100 transition-all duration-300 border border-neutral-700/10 text-sm">
                Go To DashBoard
              </button>
            </Link>
          </div>
        </Show>
      </div>
    </main>
  );
}
