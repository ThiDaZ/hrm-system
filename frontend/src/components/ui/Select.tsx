interface Option {
    value: string | number;
    label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: Option[];
    error?: string;
}

export default function Select({ label, options, error, ...props }: SelectProps) {
    return (
        <div className="flex flex-col gap-1 w-full mb-4">
            <label className="text-sm font-medium text-slate-700">{label}</label>
            <select
                className={`border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white ${
                    error ? "border-red-500 focus:ring-red-500" : "border-slate-300"
                }`}
                {...props}
            >
                <option value="" disabled>Select an option</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
    );
}