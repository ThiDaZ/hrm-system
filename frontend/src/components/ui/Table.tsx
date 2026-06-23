interface TableProps {
    headers: string[];
    children: React.ReactNode;
}

export default function Table({ headers, children }: TableProps) {
    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-slate-200">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-800">
                <tr>
                    {headers.map((header, index) => (
                        <th key={index} className="px-6 py-4 font-medium">
                            {header}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {children}
                </tbody>
            </table>
        </div>
    );
}