interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export default function Input({ label, error, ...props }: InputProps) {
    return (
        <div className="flex flex-col gap-1 w-full mb-4">
            <label className="text-sm font-medium text-surface-deep">{label}</label>
            <input
                className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                    error ? "border-danger focus:ring-danger" : "border-slate-300"
                }`}
                {...props}
            />
            {error && <span className="text-xs text-danger">{error}</span>}
        </div>
    );
}