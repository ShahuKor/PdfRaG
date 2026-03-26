"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

interface PdfViewerProps {
  pdfId: string;
  filename?: string;
}

type LoadState = "fetching-url" | "loading-pdf" | "ready" | "error";

export default function PdfViewer({ pdfId, filename }: PdfViewerProps) {
  const { getToken } = useAuth();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [state, setState] = useState<LoadState>("fetching-url");
  const [error, setError] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

  useEffect(() => {
    async function fetchPresignedUrl() {
      try {
        setState("fetching-url");
        const token = await getToken();
        const res = await fetch(`${API}/api/pdfs/${pdfId}/url`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Failed to load PDF");
        }
        const data = await res.json();
        setPdfUrl(data.url);
        setState("loading-pdf");
      } catch (e: any) {
        setError(e.message);
        setState("error");
      }
    }
    fetchPresignedUrl();
  }, [pdfId]);

  if (state === "error") {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-400">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="w-9 h-9 opacity-40"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
        <div className="text-center">
          <p className="text-sm font-medium text-neutral-600">
            Couldn't load PDF
          </p>
          <p className="text-xs text-neutral-400 mt-0.5">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col rounded-xl border border-neutral-200 overflow-hidden bg-white shadow-sm">
      {/* Toolbar */}
      {filename && (
        <div className="shrink-0 flex items-center gap-2 px-4 h-10 border-b border-neutral-100 bg-neutral-50">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-3.5 h-3.5 text-indigo-400 shrink-0"
          >
            <path d="M3 3.5A1.5 1.5 0 014.5 2h6.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0116 6.622V16.5a1.5 1.5 0 01-1.5 1.5h-10A1.5 1.5 0 013 16.5v-13z" />
          </svg>
          <span className="text-xs text-neutral-500 truncate">{filename}</span>
        </div>
      )}

      {/* Spinner overlay — shown until iframe fires onLoad */}
      {state !== "ready" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-50 z-10">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-neutral-200" />
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-indigo-400"
              >
                <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-neutral-400">
            {state === "fetching-url" ? "Fetching document…" : "Rendering PDF…"}
          </p>
        </div>
      )}

      {/* iframe — always mounted once URL is ready so onLoad can fire */}
      {pdfUrl && (
        <iframe
          src={pdfUrl}
          className="flex-1 w-full"
          title={filename ?? "PDF Viewer"}
          onLoad={() => setState("ready")}
          onError={() => {
            setError("Failed to render PDF in browser.");
            setState("error");
          }}
        />
      )}
    </div>
  );
}
