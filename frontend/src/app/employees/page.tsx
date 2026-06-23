"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import FileUpload from "@/components/ui/FileUpload";
import { api } from "@/lib/api";

export default function EmployeesPage() {
    // store data from the database
    const [employees, setEmployees] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [positions, setPositions] = useState<any[]>([]);
    const [fetchTrigger, setFetchTrigger] = useState(0);

    // form input states
    const [employeeCode, setEmployeeCode] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [positionId, setPositionId] = useState("");
    const [joiningDate, setJoiningDate] = useState("");
    const [basicSalary, setBasicSalary] = useState("");
    const [employmentType, setEmploymentType] = useState("Full-Time");

    // file upload state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Lload all necessary data when the page opens
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [empData, deptData, posData] = await Promise.all([
                    api.get("employees"),
                    api.get("departments"),
                    api.get("positions")
                ]);
                setEmployees(empData.sort((a: any, b: any) => a.id - b.id));
                setDepartments(deptData);
                setPositions(posData);
            } catch (error) {
                console.error("Failed to load data");
            }
        };
        fetchAllData();
    }, [fetchTrigger]);

    // handle the form submission
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Save the text data first
            const newEmployee = await api.post("employees", {
                employee_code: employeeCode,
                first_name: firstName,
                last_name: lastName,
                email: email,
                department_id: Number(departmentId),
                position_id: Number(positionId),
                joining_date: joiningDate,
                basic_salary: Number(basicSalary),
                employment_type: employmentType,
                status: "ONBOARDING"
            });

            // If a file was chosen, upload it to the new employee's profile
            if (selectedFile) {
                const formData = new FormData();
                formData.append("document_type", "Identity/CV");
                formData.append("file", selectedFile);

                await api.post(`employees/${newEmployee.id}/documents`, formData);
            }

            // clear the form
            setEmployeeCode("");
            setFirstName("");
            setLastName("");
            setEmail("");
            setDepartmentId("");
            setPositionId("");
            setJoiningDate("");
            setBasicSalary("");
            setSelectedFile(null);

            // refresh the table
            setFetchTrigger((prev) => prev + 1);

        } catch (error: any) {
            alert(error.message || "Failed to create employee");
        } finally {
            setIsLoading(false);
        }
    };

    // convert data for the dropdown menus
    const deptOptions = departments.map(d => ({ value: d.id, label: d.name }));

    // only show positions that belong to the chosen department.ts
    const filteredPositions = positions
        .filter(p => p.department_id === Number(departmentId))
        .map(p => ({ value: p.id, label: p.title }));

    const employmentTypeOptions = [
        { value: "Full-Time", label: "Full-Time" },
        { value: "Part-Time", label: "Part-Time" },
        { value: "Contract", label: "Contract" }
    ];

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <h1 className="text-2xl font-bold text-surface-deep">Employee Onboarding</h1>

                {/* The Registration Form */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-lg font-medium mb-6 text-surface-deep">Register New Employee</h2>

                    <form onSubmit={handleCreate} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input label="Employee Code" value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} required placeholder="EMP-001" />
                            <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                            <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                            <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <Input label="Joining Date" type="date" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} required />
                            <Input label="Basic Salary (Rs)" type="number" value={basicSalary} onChange={(e) => setBasicSalary(e.target.value)} required />

                            <Select label="Department" options={deptOptions} value={departmentId} onChange={(e) => { setDepartmentId(e.target.value); setPositionId(""); }} required />
                            <Select label="Position" options={filteredPositions} value={positionId} onChange={(e) => setPositionId(e.target.value)} required disabled={!departmentId} />
                            <Select label="Employment Type" options={employmentTypeOptions} value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} required />
                        </div>

                        {/* The File Upload Area */}
                        <div className="border-t border-slate-200 pt-6">
                            <h3 className="text-sm font-medium text-surface-deep mb-4">Required Documents</h3>
                            <FileUpload
                                label="Upload CV or Identity Document"
                                accept=".pdf,.jpg,.png"
                                selectedFile={selectedFile}
                                onChange={(file) => setSelectedFile(file)}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" isLoading={isLoading} className="w-full md:w-auto px-8">
                                Complete Onboarding
                            </Button>
                        </div>
                    </form>
                </div>

                {/* The Employee Roster Table */}
                <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                    <div className="p-4 border-b border-slate-200">
                        <h2 className="text-lg font-medium text-surface-deep">Active Roster</h2>
                    </div>
                    <Table headers={["Code", "Name", "Email", "Type", "Status"]}>
                        {employees.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-slate-500">
                                    No employees boarded yet.
                                </td>
                            </tr>
                        ) : (
                            employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-surface-deep">{emp.employee_code}</td>
                                    <td className="px-6 py-4">{emp.first_name} {emp.last_name}</td>
                                    <td className="px-6 py-4">{emp.email}</td>
                                    <td className="px-6 py-4 text-slate-600">{emp.employment_type}</td>
                                    <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-primary-hover">
                      {emp.status}
                    </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </Table>
                </div>
            </div>
        </DashboardLayout>
    );
}