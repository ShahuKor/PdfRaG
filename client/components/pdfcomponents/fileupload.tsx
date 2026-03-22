import { Upload } from "lucide-react";

export default function FileUpload() {
  const handlefileupload = () => {
    const el = document.createElement("input");
    el.setAttribute("type", "file");
    el.setAttribute("accept", "application/pdf");
    el.addEventListener("change", async (e) => {
      if (el.files && el.files.length > 0) {
        const file = el.files.item(0);
        if (file) {
          const formData = new FormData();
          formData.append("pdf", file);

          await fetch("http://localhost:8000/pdf/upload", {
            method: "POST",
            body: formData,
          });

          console.log("File Uploaded");
        }
      }
    });
    el.click();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <button
        onClick={handlefileupload}
        className="flex flex-col items-center justify-center bg-neutral-900 text-neutral-200 p-3 rounded-xl hover:bg-neutral-800 hover:text-neutral-100 transition-all duration-300 hover:cursor-pointer"
      >
        Upload Your File
        <Upload />
      </button>
    </div>
  );
}
