"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingDown, TrendingUp, Users, Package, Eye, MapPin } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const alertData = [
  { date: "2024-07-01", sales: 45000, predicted: 48000 },
  { date: "2024-07-02", sales: 52000, predicted: 49000 },
  { date: "2024-07-03", sales: 48000, predicted: 47000 },
  { date: "2024-07-04", sales: 35000, predicted: 50000 }, // Alert triggered
  { date: "2024-07-05", sales: 51000, predicted: 52000 },
  { date: "2024-07-06", sales: 49000, predicted: 48000 },
  { date: "2024-07-07", sales: 53000, predicted: 51000 },
];

interface AlertItemProps {
  title: string;
  description: string;
  impact: string;
  severity: "critical" | "high" | "medium" | "low";
  date: string;
  icon: React.ReactNode;
}

function AlertItem({ title, description, impact, severity, date, icon }: AlertItemProps) {
  const severityStyles = {
    critical: "border-red-600 bg-red-50 text-red-900",
    high: "border-red-500 bg-red-50 text-red-800",
    medium: "border-yellow-500 bg-yellow-50 text-yellow-800",
    low: "border-blue-500 bg-blue-50 text-blue-800",
  };

  const severityColors = {
    critical: "bg-red-600 text-white",
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-blue-100 text-blue-800",
  };

  return (
    <Card className={`border-l-4 ${severityStyles[severity]}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-white">
              {icon}
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{impact}</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${severityColors[severity]}`}>
              {severity.toUpperCase()}
            </span>
            <p className="text-xs text-gray-500 mt-1">{date}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-700 mb-3">{description}</p>
        <div className="flex space-x-2">
          <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 font-medium">
            Investigate
          </button>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View Details
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export function Alerts() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Business Alerts</h2>
        <p className="text-muted-foreground">
          Stay ahead of the curve with real-time business alerts. Our system identifies unusual patterns in your data, providing you with actionable insights to address potential issues and capitalize on opportunities.
        </p>
      </div>

      {/* Sales Alert Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Performance vs Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={alertData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value, name) => [
                  `$${(Number(value) / 1000).toFixed(0)}K`, 
                  name === 'sales' ? 'Actual Sales' : 'Predicted Sales'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#94a3b8" 
                strokeDasharray="5 5"
                name="predicted"
              />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="#2563eb" 
                strokeWidth={2}
                name="sales"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Alert List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Active Business Alerts</h3>
        
        <div className="grid gap-4">
          <AlertItem
            title="Sales Drop in Electronics"
            description="A significant drop in sales for the 'Electronics' category was detected on July 15, 2024. This could be due to supply chain issues or a shift in consumer preferences. Investigate inventory levels and monitor competitor activity."
            impact="Potential Impact: Revenue Loss"
            severity="critical"
            date="July 15, 2024"
            icon={<TrendingDown className="w-5 h-5 text-red-600" />}
          />
          
                    <AlertItem
            title="Unusual Shopping Pattern Detected"
            description="A significant deviation in shopping patterns was detected on July 15, 2024. There was a 40% increase in premium bag purchases compared to the previous week, which could indicate a successful promotional campaign or external market influences."
            impact="Potential Impact: Inventory Shortage"
            severity="high"
            date="July 15, 2024"
            icon={<AlertTriangle className="w-5 h-5 text-red-600" />}
          />
          
          <AlertItem
            title="Product View Anomaly"
            description="The product 'Premium Leather Handbag' experienced a 200% increase in views but only a 10% increase in purchases on July 16, 2024. This might indicate pricing issues or technical problems with the checkout process."
            impact="Potential Impact: Lost Revenue"
            severity="medium"
            date="July 16, 2024"
            icon={<Eye className="w-5 h-5 text-blue-600" />}
          />
          
          <AlertItem
            title="Regional Sales Drop"
            description="Sales in the 'West Coast' region dropped by 25% on July 17, 2024, compared to the same day last week. This could be due to regional events, shipping issues, or competitor activities."
            impact="Potential Impact: Revenue Loss"
            severity="high"
            date="July 17, 2024"
            icon={<MapPin className="w-5 h-5 text-purple-600" />}
          />
          
          <AlertItem
            title="Demand Surge in Outdoor Gear"
            description="An unexpected surge in demand for 'Outdoor Gear' was observed on July 18, 2024. This could be due to a successful marketing campaign or external factors like weather changes. Ensure sufficient stock levels to meet demand."
            impact="Potential Impact: Increased Sales"
            severity="high"
            date="July 18, 2024"
            icon={<TrendingUp className="w-5 h-5 text-green-600" />}
          />
          
          <AlertItem
            title="Customer Service Complaints Increase"
            description="A sudden increase in customer complaints related to 'Customer Service' was reported on July 20, 2024. This could indicate issues with service quality or staff training. Review recent customer interactions and address any systemic problems."
            impact="Potential Impact: Customer Dissatisfaction"
            severity="medium"
            date="July 20, 2024"
            icon={<Users className="w-5 h-5 text-yellow-600" />}
          />
          
          <AlertItem
            title="Clothing Returns Spike"
            description="A spike in returns for 'Clothing' items was detected on July 22, 2024. This could be due to quality issues or incorrect sizing information. Investigate return reasons and review product descriptions."
            impact="Potential Impact: Increased Costs"
            severity="medium"
            date="July 22, 2024"
            icon={<Package className="w-5 h-5 text-orange-600" />}
          />
          
          <AlertItem
            title="Customer Service Complaints Increase"
            description="A sudden increase in customer complaints related to 'Customer Service' was reported on July 20, 2024. This could indicate issues with service quality or staff training. Review recent customer interactions and address any systemic problems."
            impact="Potential Impact: Customer Dissatisfaction"
            severity="medium"
            date="July 20, 2024"
            icon={<Users className="w-5 h-5 text-yellow-600" />}
          />
          
          <AlertItem
            title="Clothing Returns Spike"
            description="A spike in returns for 'Clothing' items was detected on July 22, 2024. This could be due to quality issues or incorrect sizing information. Investigate return reasons and review product descriptions."
            impact="Potential Impact: Increased Costs"
            severity="medium"
            date="July 22, 2024"
            icon={<Package className="w-5 h-5 text-orange-600" />}
          />
        </div>
      </div>
    </div>
  );
}