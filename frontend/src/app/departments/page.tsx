"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { api } from "@/lib/api";

// Define the TypeScript interface for a Department
interface Department {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
}

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [fetchTrigger, setFetchTrigger] = useState(0);

    // Fetch departments when the page loads or when fetchTrigger changes
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const data = await api.get("departments");
                setDepartments(data);
            } catch (error) {
                console.error("Failed to fetch departments", error);
            }
        };
        fetchDepartments();
    }, [fetchTrigger]);

    // Handle creating a new department
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post("departments", { name, description });
            setName("");
            setDescription("");
            // Increment trigger to refresh the table
            setFetchTrigger((prev) => prev + 1);
        } catch (error: any) {
            alert(error.message || "Failed to create department");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-800">Departments</h1>
                </div>

                {/* Create Department Form */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-lg font-medium mb-4 text-slate-800">Add New Department</h2>
                    <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-start">
                        <div className="flex-1 w-full">
                            <Input
                                label="Department Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="e.g., Engineering"
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <Input
                                label="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Optional description"
                            />
                        </div>
                        <div className="mt-6 w-full md:w-auto">
                            <Button type="submit" isLoading={isLoading}>Save</Button>
                        </div>
                    </form>
                </div>

                {/* Departments Table */}
                <Table headers={["ID", "Name", "Description", "Status"]}>
                    {departments.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-slate-500">
                                No departments found. Create one above!
                            </td>
                        </tr>
                    ) : (
                        departments.map((dept) => (
                            <tr key={dept.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">{dept.id}</td>
                                <td className="px-6 py-4 font-medium text-slate-800">{dept.name}</td>
                                <td className="px-6 py-4">{dept.description || "-"}</td>
                                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      dept.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {dept.is_active ? "Active" : "Inactive"}
                  </span>
                                </td>
                            </tr>
                        ))
                    )}
                </Table>
            </div>
        </DashboardLayout>
    );
}