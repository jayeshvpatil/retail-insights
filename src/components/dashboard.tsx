"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Users, Package, DollarSign, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const salesData = [
  { name: "Jan", value: 400000 },
  { name: "Feb", value: 300000 },
  { name: "Mar", value: 600000 },
  { name: "Apr", value: 800000 },
  { name: "May", value: 500000 },
  { name: "Jun", value: 750000 },
];

const categoryData = [
  { name: "Bags", value: 300000, color: "#8884d8" },
  { name: "Shirts", value: 450000, color: "#82ca9d" },
  { name: "Shoes", value: 350000, color: "#ffc658" },
  { name: "Accessories", value: 200000, color: "#ff7300" },
];

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

function KPICard({ title, value, change, isPositive, icon }: KPICardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`text-xs flex items-center ${isPositive ? "text-green-600" : "text-red-600"}`}>
          {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
          {change} vs last period
        </p>
      </CardContent>
    </Card>
  );
}

interface AnomalyCardProps {
  title: string;
  description: string;
  impact: string;
  severity: "high" | "medium" | "low";
  action: string;
}

function AnomalyCard({ title, description, impact, severity, action }: AnomalyCardProps) {
  const severityColors = {
    high: "border-red-500 bg-red-50",
    medium: "border-yellow-500 bg-yellow-50",
    low: "border-blue-500 bg-blue-50",
  };

  return (
    <Card className={`border-l-4 ${severityColors[severity]}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              {title}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{impact}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded ${
            severity === "high" ? "bg-red-100 text-red-800" :
            severity === "medium" ? "bg-yellow-100 text-yellow-800" :
            "bg-blue-100 text-blue-800"
          }`}>
            {severity.toUpperCase()}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 mb-2">{description}</p>
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          {action}
        </button>
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">
          Your retail business insights at a glance
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Sales"
          value="$2.5M"
          change="+10%"
          isPositive={true}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Customer Engagement"
          value="45%"
          change="-5%"
          isPositive={false}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Inventory Levels"
          value="80%"
          change="+2%"
          isPositive={true}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />
        <KPICard
          title="Conversion Rate"
          value="3.2%"
          change="+0.5%"
          isPositive={true}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Sales Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${(Number(value) / 1000).toFixed(0)}K`, 'Sales']} />
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${(Number(value) / 1000).toFixed(0)}K`, 'Sales']} />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Anomalies */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Recent Anomalies</h3>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
          <AnomalyCard
            title="Sudden Drop in Sales"
            description="A significant decrease in sales was observed in the last week, potentially due to a shift in consumer behavior or external market factors."
            impact="Potential Impact: Revenue Loss"
            severity="high"
            action="Investigate"
          />
          <AnomalyCard
            title="Increase in Customer Churn"
            description="Customer churn has increased by 15% in the past month. This could be attributed to changes in service quality, competitive offers, or unmet customer expectations."
            impact="Potential Impact: Customer Dissatisfaction"
            severity="medium"
            action="Investigate"
          />
          <AnomalyCard
            title="Inventory Discrepancy"
            description="Anomalies detected in inventory levels indicate potential discrepancies between recorded stock and actual physical inventory."
            impact="Potential Impact: Increased Costs"
            severity="medium"
            action="Investigate"
          />
          <AnomalyCard
            title="Clothing Returns Spike"
            description="A spike in returns for 'Clothing' items was detected on July 22, 2024. This could be due to quality issues or incorrect sizing information."
            impact="Potential Impact: Increased Costs"
            severity="low"
            action="Investigate"
          />
        </div>
      </div>
    </div>
  );
}