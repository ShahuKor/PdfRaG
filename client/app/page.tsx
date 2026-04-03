import GetStarted from "@/components/common/GetStarted";
import Hero from "@/components/common/Hero";
import HowItWorks from "@/components/common/HowItWorks";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, #c8c8c0 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="relative">
        <div className="absolute -top-16 -left-20 w-80 h-80 rounded-full bg-teal-100/60 blur-[80px] opacity-60 pointer-events-none" />
        <Hero />
        <HowItWorks />
        <GetStarted />
      </div>
    </div>
  );
}
