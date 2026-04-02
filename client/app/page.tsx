import { Container } from "@/components/common/Container";
import Hero from "@/components/common/Hero";

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
      <div className="relative overflow-hidden">
        <div className="absolute -top-16 -left-20 w-80 h-80 rounded-full bg-blue-100 blur-[80px] opacity-60 pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-amber-100 blur-[70px] opacity-65 pointer-events-none" />
        <Hero />
      </div>
    </div>
  );
}
