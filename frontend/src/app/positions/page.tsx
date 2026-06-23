"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { api } from "@/lib/api";

interface Department {
    id: number;
    name: string;
}

interface Position {
    id: number;
    title: string;
    description: string | null;
    department_id: number;
    is_active: boolean;
}

export default function PositionsPage() {
    const [positions, setPositions] = useState<Position[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [fetchTrigger, setFetchTrigger] = useState(0);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPos, setEditingPos] = useState<Position | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editDepartmentId, setEditDepartmentId] = useState("");
    const [editIsActive, setEditIsActive] = useState(true);
    const [isEditLoading, setIsEditLoading] = useState(false);

    // Fetch both positions and departments
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [posData, deptData] = await Promise.all([
                    api.get("positions"),
                    api.get("departments")
                ]);
                setPositions(posData.sort((a: Position, b: Position) => a.id - b.id));
                setDepartments(deptData);
            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };
        fetchData();
    }, [fetchTrigger]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post("positions", {
                title,
                description,
                department_id: Number(departmentId)
            });
            setTitle("");
            setDescription("");
            setDepartmentId("");
            setFetchTrigger((prev) => prev + 1);
        } catch (error: any) {
            alert(error.message || "Failed to create position");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this position?")) return;
        try {
            await api.request(`positions/${id}`, { method: "DELETE" });
            setFetchTrigger((prev) => prev + 1);
        } catch (error: any) {
            alert(error.message || "Failed to delete position");
        }
    };

    const openEditModal = (pos: Position) => {
        setEditingPos(pos);
        setEditTitle(pos.title);
        setEditDescription(pos.description || "");
        setEditDepartmentId(String(pos.department_id));
        setEditIsActive(pos.is_active);
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPos) return;

        setIsEditLoading(true);
        try {
            await api.request(`positions/${editingPos.id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    title: editTitle,
                    description: editDescription,
                    department_id: Number(editDepartmentId),
                    is_active: editIsActive,
                }),
            });
            setIsEditModalOpen(false);
            setFetchTrigger((prev) => prev + 1);
        } catch (error: any) {
            alert(error.message || "Failed to update position");
        } finally {
            setIsEditLoading(false);
        }
    };

    // Convert departments to the format required by our Select component
    const departmentOptions = departments.map(d => ({
        value: d.id,
        label: d.name
    }));

    // Helper to map department ID to its name for the table display
    const getDepartmentName = (id: number) => {
        const dept = departments.find(d => d.id === id);
        return dept ? dept.name : `Unknown (ID: ${id})`;
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <h1 className="text-2xl font-bold text-slate-800">Positions</h1>

                {/* Create Position Form */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-lg font-medium mb-4 text-slate-800">Add New Position</h2>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                        <Input
                            label="Job Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="e.g., Frontend Developer"
                        />
                        <Select
                            label="Department"
                            options={departmentOptions}
                            value={departmentId}
                            onChange={(e) => setDepartmentId(e.target.value)}
                            required
                        />
                        <Input
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional description"
                        />
                        <div className="md:col-span-3 flex justify-end mt-2">
                            <Button type="submit" isLoading={isLoading} className="w-full md:w-auto">
                                Save Position
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Positions Table */}
                <Table headers={["ID", "Title", "Department", "Description", "Status", "Actions"]}>
                    {positions.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-slate-500">
                                No positions found. Create one above!
                            </td>
                        </tr>
                    ) : (
                        positions.map((pos) => (
                            <tr key={pos.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">{pos.id}</td>
                                <td className="px-6 py-4 font-medium text-slate-800">{pos.title}</td>
                                <td className="px-6 py-4">{getDepartmentName(pos.department_id)}</td>
                                <td className="px-6 py-4">{pos.description || "-"}</td>
                                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pos.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {pos.is_active ? "Active" : "Inactive"}
                  </span>
                                </td>
                                <td className="px-6 py-4 flex gap-3">
                                    <button onClick={() => openEditModal(pos)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                                    <button onClick={() => handleDelete(pos.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                                </td>
                            </tr>
                        ))
                    )}
                </Table>

                {/* Edit Modal */}
                <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Position">
                    <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                        <Input label="Job Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
                        <Select
                            label="Department"
                            options={departmentOptions}
                            value={editDepartmentId}
                            onChange={(e) => setEditDepartmentId(e.target.value)}
                            required
                        />
                        <Input label="Description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                        <Select
                            label="Status"
                            options={[{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }]}
                            value={editIsActive ? "true" : "false"}
                            onChange={(e) => setEditIsActive(e.target.value === "true")}
                        />
                        <div className="mt-2 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md">Cancel</button>
                            <Button type="submit" isLoading={isEditLoading}>Update Position</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}