"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, TrendingUp } from "lucide-react";

interface ReportCardProps {
  title: string;
  description: string;
  lastGenerated: string;
  fileSize: string;
}

function ReportCard({ title, description, lastGenerated, fileSize }: ReportCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">{title}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
          </div>
          <Button size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {lastGenerated}
          </div>
          <span>{fileSize}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function Reports() {
  const reports = [
    {
      title: "Quarterly Sales Report",
      description: "Comprehensive analysis of sales performance across all product categories for Q2 2024.",
      lastGenerated: "August 1, 2024",
      fileSize: "2.3 MB",
      downloadUrl: "/reports/quarterly-sales-q2-2024.pdf",
    },
    {
      title: "Customer Analytics Report",
      description: "Deep dive into customer behavior, segmentation, and lifetime value analysis.",
      lastGenerated: "July 28, 2024",
      fileSize: "1.8 MB",
      downloadUrl: "/reports/customer-analytics-july-2024.pdf",
    },
    {
      title: "Inventory Management Report",
      description: "Stock levels, turnover rates, and inventory optimization recommendations.",
      lastGenerated: "July 30, 2024",
      fileSize: "1.2 MB",
      downloadUrl: "/reports/inventory-management-july-2024.pdf",
    },
    {
      title: "Marketing Campaign Analysis",
      description: "ROI analysis and performance metrics for recent marketing campaigns.",
      lastGenerated: "July 25, 2024",
      fileSize: "3.1 MB",
      downloadUrl: "/reports/marketing-campaign-analysis-july-2024.pdf",
    },
    {
      title: "Financial Performance Summary",
      description: "Revenue, profit margins, and key financial metrics overview.",
      lastGenerated: "July 31, 2024",
      fileSize: "0.9 MB",
      downloadUrl: "/reports/financial-performance-july-2024.pdf",
    },
    {
      title: "Product Performance Analysis",
      description: "Best and worst performing products across different categories and regions.",
      lastGenerated: "July 29, 2024",
      fileSize: "2.7 MB",
      downloadUrl: "/reports/product-performance-july-2024.pdf",
    },
  ];

  const quickStats = [
    { label: "Reports Generated", value: "124", change: "+12%" },
    { label: "Data Points Analyzed", value: "2.4M", change: "+18%" },
    { label: "Insights Delivered", value: "356", change: "+7%" },
    { label: "Automated Reports", value: "28", change: "+5%" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">
            Access comprehensive business reports and analytics
          </p>
        </div>
        <Button>
          <FileText className="w-4 h-4 mr-2" />
          Generate New Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {reports.map((report, index) => (
          <ReportCard
            key={index}
            title={report.title}
            description={report.description}
            lastGenerated={report.lastGenerated}
            fileSize={report.fileSize}
          />
        ))}
      </div>

      {/* Report Categories */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Weekly Sales Summary</p>
                <p className="text-sm text-gray-600">Every Monday at 9:00 AM</p>
              </div>
              <Button size="sm" variant="outline">Edit</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Monthly Inventory Report</p>
                <p className="text-sm text-gray-600">1st of every month</p>
              </div>
              <Button size="sm" variant="outline">Edit</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Quarterly Business Review</p>
                <p className="text-sm text-gray-600">End of every quarter</p>
              </div>
              <Button size="sm" variant="outline">Edit</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Sales Performance Template</p>
                <p className="text-sm text-gray-600">Standard sales analysis</p>
              </div>
              <Button size="sm" variant="outline">Use</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Customer Insights Template</p>
                <p className="text-sm text-gray-600">Customer behavior analysis</p>
              </div>
              <Button size="sm" variant="outline">Use</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Financial Summary Template</p>
                <p className="text-sm text-gray-600">Financial metrics overview</p>
              </div>
              <Button size="sm" variant="outline">Use</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}