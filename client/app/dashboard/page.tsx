"use client";
import ChatComponent from "@/components/pdfcomponents/ChatComponent";
import FileUpload from "@/components/pdfcomponents/fileupload";

export default function Page() {
  return (
    <div className="w-full h-screen overflow-hidden">
      <div className="p-20 flex flex-col h-full w-full justify-center">
        <ChatComponent />
      </div>
    </div>
  );
}
