"use client";

import {useEffect, useState} from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            router.push("/dashboard");
        }
    }, [router]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            await api.post("/auth/register", formData);
            // on success, redirect to login
            router.push("/login");
        } catch (err: any) {
            setError(err.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6 text-slate-800">Create Account</h1>

                {error && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm">{error}</div>
                )}

                <form onSubmit={handleRegister}>
                    <Input
                        label="Full Name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                    />

                    <div className="mt-6">
                        <Button type="submit" isLoading={isLoading}>Register</Button>
                    </div>

                    <p className="text-center text-sm text-slate-600 mt-4">
                        Already have an account?{" "}
                        <a href="/login" className="text-blue-600 hover:underline">Sign In</a>
                    </p>
                </form>
            </div>
        </div>
    );
}