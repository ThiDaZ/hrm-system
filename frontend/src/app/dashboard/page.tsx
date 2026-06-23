"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/Card";
import { api } from "@/lib/api";

export default function DashboardPage() {
    const [metrics, setMetrics] = useState({
        totalEmployees: 0,
        totalDepartments: 0,
        totalPositions: 0,
        pendingPayrolls: 0,
        monthlyPayroll: 0,
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // we use Promise.all to fetch all master data simultaneously
                const [deptRes, posRes, empRes] = await Promise.all([
                    api.get("departments").catch(() => []),
                    api.get("positions").catch(() => []),
                    api.get("employees").catch(() => [])
                ]);

                setMetrics({
                    totalDepartments: deptRes.length || 0,
                    totalPositions: posRes.length || 0,
                    totalEmployees: empRes.length || 0,
                    pendingPayrolls: 0, // Will wire to payroll API later
                    monthlyPayroll: 0,  // Will wire to payroll API later
                });
            } catch (error) {
                console.error("Failed to fetch metrics");
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <h1 className="text-2xl font-bold text-surface-deep">Dashboard Overview</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card title="Total Employees" value={metrics.totalEmployees} />
                    <Card title="Total Departments" value={metrics.totalDepartments} />
                    <Card title="Total Positions" value={metrics.totalPositions} />
                    <Card title="Pending Payrolls" value={metrics.pendingPayrolls} />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-surface-deep mb-4">Monthly Payroll Total</h3>
                    <p className="text-4xl font-bold text-primary-hover">
                        Rs {metrics.monthlyPayroll.toLocaleString()}
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
}