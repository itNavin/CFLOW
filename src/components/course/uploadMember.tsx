import { useState, useRef, useEffect } from "react";

export const UploadMemberModal = ({
    initial,
    onClose,
    onSubmit,
}: {
    initial?: { program: "CS" | "DSI" };
    onClose: () => void;
    onSubmit: (file: File) => void | Promise<void>;
}) => {
    const [program, setProgram] = useState<"CS" | "DSI">(initial?.program ?? "CS");
    const [role, setRole] = useState<"STUDENT" | "LECTURER" | "STAFF">("STUDENT");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const canSubmit = selectedFile !== null;

    const panelRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        const onClick = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener("keydown", onKey);
        document.addEventListener("mousedown", onClick);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("mousedown", onClick);
        };
    }, [onClose]);

    const handleSubmit = async () => {
        if (!canSubmit || !selectedFile) return;

        setIsSubmitting(true);
        try {
            await onSubmit(selectedFile);
        } catch (error) {
            // Error handling is done in the parent component
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileSelect = (file: File) => {
        // Validate file type (CSV or Excel)
        const allowedTypes = [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (allowedTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            setSelectedFile(file);
        } else {
            alert('Please select a CSV or Excel file');
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const generateTemplate = () => {
        const baseHeaders = ["Name", "Email"];
        let roleSpecificHeaders: string[] = [];

        switch (role) {
            case "STUDENT":
                roleSpecificHeaders = ["Student ID", "Year", "Department"];
                break;
            case "LECTURER":
                roleSpecificHeaders = ["Employee ID", "Department", "Position"];
                break;
            case "STAFF":
                roleSpecificHeaders = ["Employee ID", "Department", "Position"];
                break;
        }

        const headers = [...baseHeaders, ...roleSpecificHeaders];
        const csvContent = headers.join(",") + "\n";

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${role.toLowerCase()}_template.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/40 z-40" />
            <div className="fixed inset-0 z-40 grid place-items-center p-4">
                <div
                    ref={panelRef}
                    className="w-full max-w-2xl rounded-2xl border bg-white shadow-xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                        <h3 className="text-[28px] font-medium">
                            Upload Members
                        </h3>
                        <button
                            onClick={onClose}
                            aria-label="Close"
                            className="text-2xl leading-none text-red-500 hover:text-red-600"
                        >
                            ×
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5 space-y-6 text-black">
                        {/* File Upload Area */}
                        <div>
                            <div className="text-[18px] font-semibold mb-2">
                                Course<span className="text-red-500">*</span>
                            </div>
                            <div className="flex items-center gap-8">
                                <label className="inline-flex items-center gap-2 text-[16px]">
                                    <input
                                        type="radio"
                                        name="program"
                                        value="CS"
                                        checked={program === "CS"}
                                        onChange={() => setProgram("CS")}
                                    />
                                    CS
                                </label>
                                <label className="inline-flex items-center gap-2 text-[16px]">
                                    <input
                                        type="radio"
                                        name="program"
                                        value="DSI"
                                        checked={program === "DSI"}
                                        onChange={() => setProgram("DSI")}
                                    />
                                    DSI
                                </label>
                            </div>
                        </div>
                        <div>
                            <div className="text-[18px] font-semibold mb-2">
                                Role<span className="text-red-500">*</span>
                            </div>
                            <div className="flex items-center gap-8">
                                <label className="inline-flex items-center gap-2 text-[16px]">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="STUDENT"
                                        checked={role === "STUDENT"}
                                        onChange={() => setRole("STUDENT")}
                                    />
                                    STUDENT
                                </label>
                                <label className="inline-flex items-center gap-2 text-[16px]">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="LECTURER"
                                        checked={role === "LECTURER"}
                                        onChange={() => setRole("LECTURER")}
                                    />
                                    LECTURER
                                </label>
                                <label className="inline-flex items-center gap-2 text-[16px]">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="STAFF"
                                        checked={role === "STAFF"}
                                        onChange={() => setRole("STAFF")}
                                    />
                                    STAFF
                                </label>
                            </div>
                        </div>
                        <div>
                            <div className="text-[18px] font-semibold mb-2">
                                Download Template
                            </div>
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-[16px] font-medium text-gray-800">
                                            {role} Template
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Download the CSV template for {role.toLowerCase()} upload
                                        </div>
                                    </div>
                                    <button
                                        onClick={generateTemplate}
                                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 text-[14px]"
                                    >
                                        <span>📥</span>
                                        Download Template
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="text-[18px] font-semibold mb-2">
                                Select File<span className="text-red-500">*</span>
                            </div>
                            <div className="text-sm text-gray-600 mb-3">
                                Upload a CSV or Excel file containing member information
                            </div>

                            {/* Drag and Drop Area */}
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                                    ? 'border-[#326295] bg-blue-50'
                                    : 'border-gray-300 hover:border-[#326295]'
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                {selectedFile ? (
                                    <div className="space-y-2">
                                        <div className="text-green-600 font-medium">
                                            ✓ File Selected
                                        </div>
                                        <div className="text-gray-700">
                                            {selectedFile.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {(selectedFile.size / 1024).toFixed(1)} KB
                                        </div>
                                        <button
                                            onClick={() => setSelectedFile(null)}
                                            className="text-red-500 hover:text-red-600 text-sm underline"
                                        >
                                            Remove file
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="text-4xl text-gray-400">📁</div>
                                        <div className="text-gray-600">
                                            Drag and drop your file here, or{' '}
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-[#326295] hover:underline font-medium"
                                            >
                                                browse
                                            </button>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Supported formats: CSV, Excel (.xlsx, .xls)
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Hidden File Input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileInputChange}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={!canSubmit || isSubmitting}
                            onClick={handleSubmit}
                            className="rounded px-6 py-2 text-white shadow disabled:opacity-60 bg-gradient-to-r from-[#326295] to-[#0a1c30] hover:from-[#28517c] hover:to-[#071320]"
                        >
                            {isSubmitting ? "Uploading..." : "Upload"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}