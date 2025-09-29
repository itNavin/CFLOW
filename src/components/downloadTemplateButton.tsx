// components/DownloadTemplateButton.tsx
import { Download } from "lucide-react";

type Program = "CS" | "DSI";

export default function DownloadTemplateButton({ program }: { program: Program | null }) {
  const handleDownloadTemplate = () => {
    if (!program) {
      alert("Course program not found.");
      return;
    }

    const fileName =
      program === "CS"
        ? "C-flow_CS_template.xlsx"
        : "C-flow_DSI_template.xlsx";

    const a = document.createElement("a");
    a.href = `/templates/${fileName}`; // file must exist in /public/templates
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <button
      className="inline-flex text-xl items-center gap-2 rounded px-4 py-2 text-white shadow 
                 bg-gradient-to-r from-[#326295] to-[#0a1c30] 
                 hover:from-[#28517c] hover:to-[#071320] transition"
      onClick={handleDownloadTemplate}
      disabled={!program}
    >
      <Download className="w-4 h-4" />
      Download template
    </button>
  );
}
