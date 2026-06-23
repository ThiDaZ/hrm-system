"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { api } from "@/lib/api";

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

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editIsActive, setEditIsActive] = useState(true);
    const [isEditLoading, setIsEditLoading] = useState(false);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const data = await api.get("departments");
                // Sort by ID to keep the table consistent after updates
                setDepartments(data.sort((a: Department, b: Department) => a.id - b.id));
            } catch (error) {
                console.error("Failed to fetch departments", error);
            }
        };
        fetchDepartments();
    }, [fetchTrigger]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post("departments", { name, description });
            setName("");
            setDescription("");
            setFetchTrigger((prev) => prev + 1);
        } catch (error: any) {
            alert(error.message || "Failed to create department");
        } finally {
            setIsLoading(false);
        }
    };

    // --- NEW: Delete Logic ---
    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this department?")) return;

        try {
            await api.request(`departments/${id}`, { method: "DELETE" });
            setFetchTrigger((prev) => prev + 1);
        } catch (error: any) {
            alert(error.message || "Failed to delete department");
        }
    };

    // --- NEW: Open Edit Modal Logic ---
    const openEditModal = (dept: Department) => {
        setEditingDept(dept);
        setEditName(dept.name);
        setEditDescription(dept.description || "");
        setEditIsActive(dept.is_active);
        setIsEditModalOpen(true);
    };

    // --- NEW: Update Logic ---
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingDept) return;

        setIsEditLoading(true);
        try {
            await api.request(`departments/${editingDept.id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    name: editName,
                    description: editDescription,
                    is_active: editIsActive,
                }),
            });
            setIsEditModalOpen(false);
            setFetchTrigger((prev) => prev + 1);
        } catch (error: any) {
            alert(error.message || "Failed to update department");
        } finally {
            setIsEditLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <h1 className="text-2xl font-bold text-slate-800">Departments</h1>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-lg font-medium mb-4 text-slate-800">Add New Department</h2>
                    <form onSubmit={handleCreate} className="flex flex-col md:flex-row gap-4 items-start">
                        <div className="flex-1 w-full">
                            <Input label="Department Name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., Engineering" />
                        </div>
                        <div className="flex-1 w-full">
                            <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
                        </div>
                        <div className="mt-6 w-full md:w-auto">
                            <Button type="submit" isLoading={isLoading}>Save</Button>
                        </div>
                    </form>
                </div>

                {/* Updated Table with Actions Column */}
                <Table headers={["ID", "Name", "Description", "Status", "Actions"]}>
                    {departments.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-slate-500">
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
                                {/* Actions Cell */}
                                <td className="px-6 py-4 flex gap-3">
                                    <button
                                        onClick={() => openEditModal(dept)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(dept.id)}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </Table>

                {/* Edit Department Modal */}
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    title="Edit Department"
                >
                    <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                        <Input
                            label="Department Name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            required
                        />
                        <Input
                            label="Description"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                        />

                        <div className="flex flex-col gap-1 w-full mb-4">
                            <label className="text-sm font-medium text-slate-700">Status</label>
                            <select
                                className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                                value={editIsActive ? "true" : "false"}
                                onChange={(e) => setEditIsActive(e.target.value === "true")}
                            >
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        </div>

                        <div className="mt-2 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                            >
                                Cancel
                            </button>
                            <Button type="submit" isLoading={isEditLoading}>
                                Update Department
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}