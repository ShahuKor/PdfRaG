"use client";
import ChatComponent from "@/components/pdfcomponents/ChatComponent";
import FileUpload from "@/components/pdfcomponents/fileupload";

export default function Page() {
  return (
    <div className="flex w-full min-h-screen">
      <div className="w-[30%] p-10">
        <FileUpload />
      </div>
      <div className="w-[70%] border-l border-neutral-500/40 p-10">
        <ChatComponent />
      </div>
    </div>
  );
}
