import { ChangeEvent } from "react";

interface FileUploadProps {
    label: string;
    accept?: string; // ".pdf,.jpg,.png"
    onChange: (file: File | null) => void;
    error?: string;
    selectedFile?: File | null;
}

export default function FileUpload({ label, accept, onChange, error, selectedFile }: FileUploadProps) {

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        onChange(file);
    };

    return (
        <div className="flex flex-col gap-1 w-full mb-4">
            <label className="text-sm font-medium text-slate-700">{label}</label>

            <div className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${
                error ? "border-danger bg-red-50" : "border-slate-300 hover:border-primary bg-slate-50"
            }`}>
                <input
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                    id={`file-upload-${label.replace(/\s+/g, '-')}`}
                />

                <label
                    htmlFor={`file-upload-${label.replace(/\s+/g, '-')}`}
                    className="cursor-pointer flex flex-col items-center justify-center h-full"
                >
          <span className="text-sm text-primary font-medium hover:text-primary-hover transition-colors">
            Click to browse files
          </span>
                    <span className="text-xs text-slate-500 mt-2 truncate max-w-[200px] md:max-w-xs">
            {selectedFile ? selectedFile.name : "PDF, JPG, or PNG up to 5MB"}
          </span>
                </label>
            </div>

            {error && <span className="text-xs text-danger">{error}</span>}
        </div>
    );
}