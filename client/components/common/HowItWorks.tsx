import { CheckCircle2 } from "lucide-react";
import Image from "next/image";

const features = [
  {
    title: "Dedicated Dashboard for all your PDFs",
    bullets: [
      "Easy to use dedicated Dashboard to Upload PDFs",
      "It takes less than 4 seconds for your PDF to get Uploaded, Parsed and Contextualised",
      "Easily manage your PDFs, delete anytime you want.",
    ],
    src: "/dashboard.jpg",
    alt: "dashboardimage",
  },
  {
    title: "PDF Viewer + AI Chat All-together",
    bullets: [
      "For Each PDF Uploaded you get Chat UI",
      "A PDF Viewer is also provided so that you can read it on the go",
      "Stores all the message history so that your messages dont dissapear.",
      "Start chatting immediately, AI models get all the context of the PDF from the first moment",
    ],
    src: "/chatpage.jpg",
    alt: "chatpageimage",
  },
  {
    title: "Get Citation from your PDF",
    bullets: [
      "For all the answers, AI provides actual sources that its using from your uploaded PDF",
      "No generic answers, AI only generates answers from your PDF text",
      "Sources provided are easily verifiable by using the PDF Viewer",
    ],
    src: "/sources.jpg",
    alt: "SourcesImage",
  },
];

export default function HowItWorks() {
  return (
    <section className="flex flex-col gap-12 overflow-hidden py-16 sm:gap-16 md:gap-20 md:py-24 lg:gap-24">
      {/* Header */}
      <div className="mx-auto w-full max-w-7xl px-6 md:px-8">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
          <span className="text-sm font-semibold text-yellow-400 uppercase tracking-widest">
            Features
          </span>
          <h2 className="font-sans font-medium mt-3 text-2xl md:text-4xl tracking-tight text-neutral-800">
            Get More than just a ChatBot
          </h2>
          <p className="mt-4 text-[12px] sm:text-md md:text-lg text-gray-500 leading-relaxed">
            We provide you an easy to use PDF interaction tool, integrating
            multiple AI Models and exclusive features
          </p>
        </div>
      </div>

      {/* Feature rows */}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 sm:gap-16 md:gap-20 md:px-8 lg:gap-24">
        {features.map((feature, i) => {
          const isEven = i % 2 === 0;
          return (
            <div
              key={feature.title}
              className="grid grid-cols-1 gap-10 md:gap-20 lg:grid-cols-2 lg:gap-24"
            >
              {/* Text */}
              <div
                className={`max-w-xl flex-1 self-center ${!isEven ? "lg:order-last" : ""}`}
              >
                <h3 className="text-xl md:text-2xl font-medium text-gray-900 tracking-tight">
                  {feature.title}
                </h3>
                <ul className="mt-4 space-y-4">
                  {feature.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] sm:text-sm md:text-md font-medium text-gray-700">
                        {bullet}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Image — bleeds off screen on desktop */}
              <div className="relative w-full flex-1 lg:h-[500px]">
                <div
                  className={`
                    w-full p-[5px] bg-gray-100/80
                    shadow-[0_0_0_1px_rgba(0,0,0,0.08)] rounded-2xl
                    lg:absolute lg:max-w-none
                    ${isEven ? "left-0" : "right-0"}
                  `}
                  style={{
                    aspectRatio: "2898/1666",
                    width: "clamp(400px, 50vw, 900px)",
                  }}
                >
                  <div className="relative w-full h-full overflow-hidden rounded-xl shadow-[inset_0_0_0_1px_rgba(0,0,0,0.09),0_24px_64px_-12px_rgba(0,0,0,0.18)] bg-white">
                    <Image
                      src={feature.src}
                      alt={feature.alt}
                      fill
                      className="object-cover object-top-left"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
