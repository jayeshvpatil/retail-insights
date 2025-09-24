"use client";

import React, { useState } from "react";
import { Navigation } from "@/components/navigation";
import { Dashboard } from "@/components/dashboard";
import { EnhancedChatInterface } from "@/components/enhanced-chat-interface";
import { AnomalyDetection } from "@/components/anomaly-detection";
import { Reports } from "@/components/reports";
import { ToolsOverview } from "@/components/tools-overview";

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Dashboard />;
      case "insights":
        return <Dashboard />;
      case "chat":
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h2 className="text-3xl font-bold tracking-tight mb-2">Retail Insights</h2>
                <p className="text-muted-foreground">
                  Ask questions about your retail data and get instant insights powered by AI
                </p>
              </div>
              <div className="bg-white rounded-lg border shadow-sm">
                <EnhancedChatInterface />
              </div>
            </div>
          </div>
        );
      case "tools":
        return <ToolsOverview />;
      case "reports":
        return <Reports />;
      case "anomalies":
        return <AnomalyDetection />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1">
        {renderContent()}
      </main>
    </div>
  );
}