"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Pdf {
  id: string;
  filename: string;
  status: "processing" | "ready" | "failed";
  createdAt: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { getToken } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pdfs, setPdfs] = useState<Pdf[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingPdfs, setLoadingPdfs] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

  async function authFetch(path: string, options: RequestInit = {}) {
    const token = await getToken();
    return fetch(`${API}${path}`, {
      ...options,
      headers: {
        ...(options.headers ?? {}),
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async function fetchPdfs() {
    try {
      const res = await authFetch("/api/pdfs");
      const data = await res.json();
      setPdfs(data.pdfs ?? []);
    } finally {
      setLoadingPdfs(false);
    }
  }

  useEffect(() => {
    fetchPdfs();
    // Poll every 5s to pick up status changes (processing → ready)
    const interval = setInterval(fetchPdfs, 5000);
    return () => clearInterval(interval);
  }, []);

  async function handleUpload(file: File) {
    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are supported.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setUploadError("File must be under 50 MB.");
      return;
    }
    setUploadError(null);
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("pdf", file);
      const res = await authFetch("/api/pdfs/upload", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Upload failed");
      }
      await fetchPdfs();
    } catch (e: any) {
      setUploadError(e.message);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await authFetch(`/api/pdfs/${id}`, { method: "DELETE" });
      setPdfs((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setDeletingId(null);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const statusConfig = {
    ready: {
      dot: "bg-emerald-400",
      label: "Ready",
      text: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    processing: {
      dot: "bg-amber-400 animate-pulse",
      label: "Processing",
      text: "text-amber-600",
      bg: "bg-amber-50",
    },
    failed: {
      dot: "bg-red-400",
      label: "Failed",
      text: "text-red-600",
      bg: "bg-red-50",
    },
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <Link href="/">
            <button className="mb-6 flex gap-2 items-center  bg-neutral-700 hover:bg-neutral-800 transition-all duration-300 text-white px-2 py-1 sm:py-2 rounded-sm border">
              <ArrowLeft className="size-2 sm:size-3" />
              <span className="text-[10px] sm:text-xs">Go Back</span>
            </button>
          </Link>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
            My Documents
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Upload a PDF to start chatting with it.
          </p>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`
            relative mb-8 rounded-2xl border-2 border-dashed cursor-pointer
            transition-all duration-200 p-10 flex flex-col items-center gap-3
            ${
              isDragging
                ? "border-indigo-400 bg-indigo-50/60"
                : "border-neutral-300 bg-white hover:border-indigo-300 hover:bg-indigo-50/30"
            }
            ${isUploading ? "pointer-events-none opacity-60" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
              e.target.value = "";
            }}
          />

          {isUploading ? (
            <>
              <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              <p className="text-sm font-medium text-indigo-600">Uploading…</p>
            </>
          ) : (
            <>
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isDragging ? "bg-indigo-100" : "bg-neutral-100"}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  className={`w-6 h-6 ${isDragging ? "text-indigo-500" : "text-neutral-400"}`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-neutral-700">
                  {isDragging
                    ? "Drop to upload"
                    : "Drop a PDF here or click to browse"}
                </p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  PDF only · max 50 MB
                </p>
              </div>
            </>
          )}
        </div>

        {uploadError && (
          <div className="mb-6 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            {uploadError}
          </div>
        )}

        {loadingPdfs ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-36 rounded-2xl bg-neutral-200/60 animate-pulse"
              />
            ))}
          </div>
        ) : pdfs.length === 0 ? (
          <div className="text-center py-20 text-neutral-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.2}
              className="w-12 h-12 mx-auto mb-3 opacity-40"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
            <p className="text-sm">
              No documents yet — upload your first PDF above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pdfs.map((pdf) => {
              const s = statusConfig[pdf.status];
              const isReady = pdf.status === "ready";
              return (
                <div
                  key={pdf.id}
                  onClick={() => isReady && router.push(`/chat/${pdf.id}`)}
                  className={`
                    group relative bg-white rounded-2xl border border-neutral-200/80
                    p-5 flex flex-col gap-3 shadow-sm transition-all duration-200
                    ${isReady ? "cursor-pointer hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5" : "cursor-default opacity-80"}
                  `}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        className="w-5 h-5 text-indigo-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                    </div>

                    <button
                      onClick={(e) => handleDelete(e, pdf.id)}
                      disabled={deletingId === pdf.id}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 text-neutral-300 hover:text-red-400"
                    >
                      {deletingId === pdf.id ? (
                        <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  <p className="text-sm font-medium text-neutral-800 leading-snug line-clamp-2 flex-1">
                    {pdf.filename}
                  </p>

                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {formatDate(pdf.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
