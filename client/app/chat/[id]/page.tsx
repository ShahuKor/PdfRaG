"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import ChatComponent from "@/components/pdfcomponents/ChatComponent";

interface Pdf {
  id: string;
  filename: string;
  status: "processing" | "ready" | "failed";
  createdAt: string;
}

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getToken } = useAuth();

  const [pdf, setPdf] = useState<Pdf | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

  useEffect(() => {
    async function fetchPdf() {
      try {
        const token = await getToken();
        const res = await fetch(`${API}/api/pdfs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("PDF not found");
        const data = await res.json();
        setPdf(data.pdf);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPdf();
  }, [id]);

  return (
    <div>
      <header className="shrink-0 bg-[#F7F6F3]/80 backdrop-blur border-b border-neutral-200/70 z-10">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={() => router.push("/dashboard")}
            className="p-1.5 rounded-lg hover:bg-neutral-200/60 transition-colors text-neutral-400 hover:text-neutral-700"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path
                fillRule="evenodd"
                d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <div className="flex items-center gap-2 mr-auto">
            <span className="w-7 h-7 rounded-lg bg-slate-500 flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" />
                <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
              </svg>
            </span>
            <div className="flex flex-col leading-none">
              <span className="text-[13px] font-semibold text-neutral-800 tracking-tight">
                {loading ? (
                  <span className="inline-block w-32 h-3.5 bg-neutral-200 animate-pulse rounded" />
                ) : (
                  (pdf?.filename ?? "Document")
                )}
              </span>
              {!loading && pdf && (
                <span className="text-[11px] text-neutral-400 mt-0.5">
                  {new Date(pdf.createdAt).toLocaleDateString("en-IE", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 min-h-0 max-w-4xl w-full mx-auto px-6 py-4">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-neutral-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-10 h-10 opacity-40"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <p className="text-sm">{error}</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-indigo-500 hover:underline"
            >
              Back to dashboard
            </button>
          </div>
        ) : pdf?.status !== "ready" ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-neutral-400">
            <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            <p className="text-sm text-amber-600 font-medium">
              Still processing your PDF…
            </p>
            <p className="text-xs text-neutral-400">
              This usually takes under a minute.
            </p>
          </div>
        ) : (
          <ChatComponent pdfId={id} />
        )}
      </div>
    </div>
  );
}
