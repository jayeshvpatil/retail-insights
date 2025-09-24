"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, FileSearch, BarChart3, Search, Zap, CheckCircle } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  description: string;
  agent: 'RAG' | 'SQL' | 'Both';
  icon: React.ReactNode;
  capabilities: string[];
  status: 'active' | 'maintenance' | 'offline';
}

export function ToolsOverview() {
  const tools: Tool[] = [
    {
      id: 'retrieval-tool',
      name: 'Retrieval Tool',
      description: 'Searches through unstructured documents and knowledge base for relevant information',
      agent: 'RAG',
      icon: <FileSearch className="w-6 h-6 text-green-600" />,
      capabilities: [
        'Document search and retrieval',
        'Semantic similarity matching',
        'Context extraction',
        'Source attribution'
      ],
      status: 'active'
    },
    {
      id: 'sql-database',
      name: 'SQL Database',
      description: 'Executes queries against structured retail database for analytics and reporting',
      agent: 'SQL',
      icon: <Database className="w-6 h-6 text-purple-600" />,
      capabilities: [
        'SQL query execution',
        'Data aggregation',
        'Performance metrics',
        'Historical analysis'
      ],
      status: 'active'
    },
    {
      id: 'analytics-engine',
      name: 'Analytics Engine',
      description: 'Performs advanced data analysis and generates business insights',
      agent: 'Both',
      icon: <BarChart3 className="w-6 h-6 text-blue-600" />,
      capabilities: [
        'Trend analysis',
        'Pattern recognition',
        'Predictive modeling',
        'Statistical analysis'
      ],
      status: 'active'
    },
    {
      id: 'search-optimizer',
      name: 'Search Optimizer',
      description: 'Optimizes search queries for better accuracy and relevance',
      agent: 'Both',
      icon: <Search className="w-6 h-6 text-orange-600" />,
      capabilities: [
        'Query optimization',
        'Result ranking',
        'Relevance scoring',
        'Performance tuning'
      ],
      status: 'active'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case 'RAG': return 'bg-green-50 text-green-700 border-green-200';
      case 'SQL': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Both': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tools & Capabilities</h2>
        <p className="text-muted-foreground">
          Overview of tools available to our intelligent agents
        </p>
      </div>

      {/* Tools Status Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">4</div>
                <div className="text-sm text-gray-600">Active Tools</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">2</div>
                <div className="text-sm text-gray-600">Agent Types</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">100%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">1.2s</div>
                <div className="text-sm text-gray-600">Avg Response</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tools Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <Card key={tool.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg border">
                    {tool.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getAgentColor(tool.agent)}`}>
                        {tool.agent} Agent
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tool.status)}`}>
                        {tool.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
              
              <div>
                <h4 className="text-sm font-semibold mb-2">Capabilities:</h4>
                <ul className="space-y-1">
                  {tool.capabilities.map((capability, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>{capability}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Flow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>Tool Interaction Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-sm text-gray-600">
              When a query is received, the Supervisor Agent determines which tools to use based on the query type and requirements.
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="bg-blue-100 p-4 rounded-lg">
                  <Search className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="font-semibold text-sm">Query Analysis</div>
                  <div className="text-xs text-gray-600">Supervisor determines tool requirements</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="bg-green-100 p-4 rounded-lg">
                  <Zap className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="font-semibold text-sm">Tool Execution</div>
                  <div className="text-xs text-gray-600">Agents use appropriate tools</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="bg-purple-100 p-4 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="font-semibold text-sm">Result Synthesis</div>
                  <div className="text-xs text-gray-600">Combined insights delivered</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}