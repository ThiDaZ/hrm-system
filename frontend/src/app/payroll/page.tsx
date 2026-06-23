"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { api } from "@/lib/api";

export default function PayrollPage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [payrolls, setPayrolls] = useState<any[]>([]);
    const [fetchTrigger, setFetchTrigger] = useState(0);

    const [empId, setEmpId] = useState("");
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [bonuses, setBonuses] = useState("0");
    const [deductions, setDeductions] = useState("0");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [empRes, payRes] = await Promise.all([
                    api.get("employees"),
                    api.get("payroll")
                ]);
                setEmployees(empRes);
                setPayrolls(payRes.sort((a: any, b: any) => b.id - a.id));
            } catch (error) {
                console.error("Failed to fetch data");
            }
        };
        fetchData();
    }, [fetchTrigger]);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const selectedEmp = employees.find(e => e.id === Number(empId));

        try {
            await api.post("payroll", {
                employee_id: Number(empId),
                month,
                year,
                basic_salary: selectedEmp.basic_salary,
                bonuses: Number(bonuses),
                deductions: Number(deductions),
                status: "PENDING"
            });
            setFetchTrigger(prev => prev + 1);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const empOptions = employees.map(e => ({ value: e.id, label: `${e.first_name} ${e.last_name}` }));

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <h1 className="text-2xl font-bold text-slate-800">Payroll Management</h1>

                {/* Generate Payroll Form */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h2 className="text-lg font-medium mb-4 text-slate-800">Generate Salary Slip</h2>
                    <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Select label="Select Employee" options={empOptions} value={empId} onChange={(e) => setEmpId(e.target.value)} required />
                        <Input label="Month (1-12)" type="number" value={month} onChange={(e) => setMonth(Number(e.target.value))} required />
                        <Input label="Year" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} required />
                        <Input label="Bonuses (Rs)" type="number" value={bonuses} onChange={(e) => setBonuses(e.target.value)} />
                        <Input label="Deductions (Rs)" type="number" value={deductions} onChange={(e) => setDeductions(e.target.value)} />
                        <div className="flex items-end">
                            <Button type="submit" isLoading={isLoading}>Generate Slip</Button>
                        </div>
                    </form>
                </div>

                {/* Payroll History */}
                <Table headers={["ID", "Employee", "Period", "Net Salary", "Status"]}>
                    {payrolls.map((p) => (
                        <tr key={p.id}>
                            <td className="px-6 py-4">{p.id}</td>
                            <td className="px-6 py-4">{employees.find(e => e.id === p.employee_id)?.first_name}</td>
                            <td className="px-6 py-4">{p.month}/{p.year}</td>
                            <td className="px-6 py-4 font-bold text-blue-600">Rs {p.net_salary.toLocaleString()}</td>
                            <td className="px-6 py-4">{p.status}</td>
                        </tr>
                    ))}
                </Table>
            </div>
        </DashboardLayout>
    );
}