"use client";
import FileUpload from "@/components/pdfcomponents/fileupload";

export default function Page() {
  return (
    <div className="flex w-full min-h-screen">
      <div className="w-[30%] p-10">
        <FileUpload />
      </div>
      <div className="w-[70%] border-l-2 border-neutral-300 p-10">Chat</div>
    </div>
  );
}
