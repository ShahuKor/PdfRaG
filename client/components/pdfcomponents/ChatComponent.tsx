"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import PageBadge from "../ui/PageBadge";
import TypingIndicator from "../ui/TypingIndicator";
import AIcon from "../ui/AIcon";
import UserIcon from "../ui/UserIcon";

interface Doc {
  pageContent?: string;
  metadata?: {
    loc?: { pageNumber?: number };
    source?: string;
  };
}

interface IMessage {
  role: "assistant" | "user";
  content?: string;
  documents?: Doc[];
}

interface ChatComponentProps {
  pdfId: string;
}

export default function ChatComponent({ pdfId }: ChatComponentProps) {
  const { getToken } = useAuth();
  const [message, setMessage] = useState<string>("");
  const [chatMessage, setChatMessage] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

  async function authFetch(path: string, options: RequestInit = {}) {
    const token = await getToken();
    return fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Load existing chat history on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await authFetch(`/api/pdfs/${pdfId}/chat`);
        const data = await res.json();
        if (data.messages?.length) {
          setChatMessage(
            data.messages.map((m: { role: string; content: string }) => ({
              role: m.role,
              content: m.content,
            })),
          );
        }
      } finally {
        setHistoryLoaded(true);
      }
    }
    loadHistory();
  }, [pdfId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessage, isLoading]);

  const handleSendChatMessage = async () => {
    if (!message.trim() || isLoading) return;
    const userMessage = message;
    setMessage("");
    setChatMessage((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    try {
      const res = await authFetch(`/api/pdfs/${pdfId}/chat`, {
        method: "POST",
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setChatMessage((prev) => [
        ...prev,
        { role: "assistant", content: data?.message, documents: data?.sources },
      ]);
    } catch (e: any) {
      setChatMessage((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${e.message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage();
    }
  };

  const getPageNumbers = (docs?: Doc[]) => {
    if (!docs?.length) return [];
    const pages = docs
      .map((d) => d.metadata?.loc?.pageNumber)
      .filter((p): p is number => p !== undefined);
    return [...new Set(pages)].sort((a, b) => a - b);
  };

  if (!historyLoaded) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden px-2">
      <div className="flex-1 overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-50 p-4 min-h-0">
        {chatMessage.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-neutral-400 gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-10 h-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
              />
            </svg>
            <p className="text-sm">Ask a question to get started</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {chatMessage.map((mes, index) => (
            <div
              key={index}
              className={`flex items-end gap-2 ${mes.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {mes.role === "user" ? <UserIcon /> : <AIcon />}
              <div
                className={`flex flex-col gap-1.5 max-w-[75%] ${mes.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`px-4 py-2.5 rounded-md text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                    mes.role === "user"
                      ? "bg-slate-500 text-white rounded-br-sm"
                      : "bg-white border border-neutral-200 text-neutral-800 rounded-bl-sm"
                  }`}
                >
                  {mes.content}
                </div>
                {mes.role === "assistant" &&
                  getPageNumbers(mes.documents).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 px-1 items-center">
                      <span className="text-xs text-neutral-400 mr-0.5">
                        Sources:
                      </span>
                      {getPageNumbers(mes.documents).map((page) => (
                        <PageBadge key={page} page={page} />
                      ))}
                    </div>
                  )}
              </div>
            </div>
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message…"
          disabled={isLoading}
        />
        <Button
          onClick={handleSendChatMessage}
          disabled={!message.trim() || isLoading}
          className="rounded-xl px-5"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
