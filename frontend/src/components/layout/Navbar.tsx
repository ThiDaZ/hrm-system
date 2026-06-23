import { useRouter } from "next/navigation";

export default function Navbar() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    return (
        <header className="bg-white shadow-sm h-16 flex items-center justify-end px-6 border-b border-slate-200">
            <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
            >
                Logout
            </button>
        </header>
    );
}