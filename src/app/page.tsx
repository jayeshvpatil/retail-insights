"use client";

import React, { useState } from "react";
import { Navigation } from "@/components/navigation";
import { Dashboard } from "@/components/dashboard";
import { BusinessChatInterface } from "@/components/business-chat-interface";
import { Alerts } from "@/components/alerts";
import { Reports } from "@/components/reports";

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Dashboard />;
      case "insights":
        return <Dashboard />;
      case "chat":
        return <BusinessChatInterface />;
      case "reports":
        return <Reports />;
      case "alerts":
        return <Alerts />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {activeTab !== "chat" && <Navigation activeTab={activeTab} onTabChange={setActiveTab} />}
      <main className={activeTab === "chat" ? "h-screen" : "flex-1"}>
        {activeTab === "chat" ? (
          <BusinessChatInterface onNavigationToggle={() => setActiveTab("home")} />
        ) : (
          renderContent()
        )}
      </main>
    </div>
  );
}