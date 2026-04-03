import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function GetStarted() {
  return (
    <div className="flex flex-col items-center justify-center py-15 md:py-24 px-8 md:px-2 text-center">
      <h2 className=" font-sans font-medium mt-3 text-2xl md:text-4xl tracking-tight text-neutral-800">
        Ready To Save Hours of Time understanding PDFs ?
      </h2>
      <p className="mt-5 text-[12px] sm:text-md md:text-lg text-gray-500 leading-relaxed">
        Learn Fast, Improve proficiency, and understand more information your
        document
      </p>

      <div className="mt-6 md:mt-8">
        <Link href="/sign-up">
          <div className="flex gap-2 bg-neutral-800 hover:bg-yellow-300 text-white p-2 w-25 md:w-30 rounded-sm hover:text-neutral-100 transition-all duration-300 border border-neutral-700/10 hover:border-yellow-300 items-center justify-center">
            <button className=" font-medium text-[10px] md:text-sm">
              Get Started
            </button>
            <ArrowRight className="size-4" />
          </div>
        </Link>
      </div>
    </div>
  );
}
