import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const pathname = usePathname();
    const links = [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Departments", href: "/departments" },
        { name: "Positions", href: "/positions" },
        { name: "Employees", href: "/employees" },
        { name: "Payroll", href: "/payroll" },
    ];

    return (
        <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col">
            <div className="text-xl font-bold mb-8 text-center border-b border-slate-700 pb-4">
                HRM System
            </div>
            <nav className="flex flex-col gap-2">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`p-3 rounded-md transition-colors ${
                            pathname.includes(link.href) ? "bg-blue-600" : "hover:bg-slate-800"
                        }`}
                    >
                        {link.name}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}