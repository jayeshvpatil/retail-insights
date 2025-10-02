"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  BarChart3, 
  MessageSquare, 
  FileText, 
  AlertTriangle,
  User,
  Bell,
  Settings
} from "lucide-react";
import * as Avatar from "@radix-ui/react-avatar";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "insights", label: "Insights", icon: BarChart3 },
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "alerts", label: "Business Alerts", icon: AlertTriangle },
  ];

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Retail Insights</h1>
        </div>

        {/* Navigation */}
        <nav className="flex space-x-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              onClick={() => onTabChange(item.id)}
              className="flex items-center space-x-2"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Button>
          ))}
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Bell className="w-4 h-4" />
          </Button>
          
          <Avatar.Root className="inline-flex h-8 w-8 select-none items-center justify-center overflow-hidden rounded-full bg-gray-100">
            <Avatar.Fallback
              className="text-slate-600 leading-1 flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-sm font-medium"
              delayMs={0}
            >
              <User className="w-4 h-4" />
            </Avatar.Fallback>
          </Avatar.Root>
        </div>
      </div>
    </div>
  );
}