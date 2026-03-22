"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface Doc {
  pageContent?: string;
  metadata?: {
    loc?: {
      pagenumber?: number;
    };
    source?: string;
  };
}

interface IMessage {
  role: "assistant" | "user";
  content?: string;
  documents?: Doc[];
}

export default function ChatComponent() {
  const [message, setMessage] = useState<string>("");
  const [chatMessage, setChatMessage] = useState<IMessage[]>([]);
  const handleSendChatMessage = async () => {
    setChatMessage((prev) => [...prev, { role: "user", content: message }]);
    const res = await fetch(`http://localhost:8000/chat?message=${message}`);
    const data = await res.json();
    setChatMessage((prev) => [
      ...prev,
      { role: "assistant", content: data?.message, documents: data?.docs },
    ]);
  };
  return (
    <div className="h-full flex flex-col justify-end gap-5 ">
      <div className="h-full border-neutral-500/40 border rounded-md ">
        {chatMessage.map((mes, index) => (
          <pre key={index}>{JSON.stringify(mes, null, 2)}</pre>
        ))}
      </div>
      <div>
        <div className="flex gap-3">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message query"
          />
          <Button onClick={handleSendChatMessage} disabled={!message.trim()}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
