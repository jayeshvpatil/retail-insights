"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Database, FileText, Zap, ArrowRight, Shield, Users, BarChart3 } from "lucide-react";

export function SystemArchitecture() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Architecture</h2>
        <p className="text-muted-foreground">
          Understanding how our multi-agent system processes your queries
        </p>
      </div>

      {/* Architecture Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>Multi-Agent Architecture</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* User Input */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="font-medium">User Query</span>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>

            {/* Supervisor Agent */}
            <div className="flex justify-center">
              <Card className="bg-blue-50 border-blue-200 min-w-[300px]">
                <CardHeader className="text-center pb-3">
                  <CardTitle className="text-lg flex items-center justify-center space-x-2">
                    <Brain className="w-6 h-6 text-blue-600" />
                    <span>Supervisor Agent (ReAct)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div><strong>THOUGHT:</strong> Analyzes query type and context</div>
                  <div><strong>ACTION:</strong> Decides which agents to use</div>
                  <div><strong>REASONING:</strong> Explains delegation logic</div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center space-x-8">
              <ArrowRight className="w-5 h-5 text-gray-400 rotate-45" />
              <ArrowRight className="w-5 h-5 text-gray-400 -rotate-45" />
            </div>

            {/* Worker Agents */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-green-50 border-green-200">
                <CardHeader className="text-center pb-3">
                  <CardTitle className="text-lg flex items-center justify-center space-x-2">
                    <FileText className="w-6 h-6 text-green-600" />
                    <span>RAG Agent</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <strong>Purpose:</strong> Queries unstructured documents
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span className="text-sm">Vector Database</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <span className="text-sm">Retrieval Tool</span>
                    </div>
                  </div>
                  <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
                    Handles: Policies, guides, recommendations, best practices
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardHeader className="text-center pb-3">
                  <CardTitle className="text-lg flex items-center justify-center space-x-2">
                    <Database className="w-6 h-6 text-purple-600" />
                    <span>SQL Agent</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <strong>Purpose:</strong> Queries structured databases
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                      <span className="text-sm">SQL Database</span>
                    </div>
                  </div>
                  <div className="text-xs text-purple-700 bg-purple-100 p-2 rounded">
                    Handles: Sales data, metrics, analytics, KPIs
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center space-x-8">
              <ArrowRight className="w-5 h-5 text-gray-400 -rotate-45" />
              <ArrowRight className="w-5 h-5 text-gray-400 rotate-45" />
            </div>

            {/* Synthesis */}
            <div className="flex justify-center">
              <Card className="bg-blue-50 border-blue-200 min-w-[300px]">
                <CardHeader className="text-center pb-3">
                  <CardTitle className="text-lg flex items-center justify-center space-x-2">
                    <Zap className="w-6 h-6 text-blue-600" />
                    <span>Response Synthesis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-center">
                  Supervisor combines insights from all agents into a comprehensive answer
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>

            {/* Safeguarded Output */}
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-lg border border-green-200">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-700">Safeguarded Response</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Capabilities */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <span>Supervisor Agent</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>• Query analysis and classification</div>
            <div>• Agent delegation strategy</div>
            <div>• Response synthesis and coordination</div>
            <div>• Quality assurance and safeguarding</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-green-600" />
              <span>RAG Agent</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>• Document retrieval and analysis</div>
            <div>• Policy and procedure queries</div>
            <div>• Best practice recommendations</div>
            <div>• Contextual business guidance</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-purple-600" />
              <span>SQL Agent</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>• SQL query generation</div>
            <div>• Data analysis and metrics</div>
            <div>• Performance reporting</div>
            <div>• Business intelligence insights</div>
          </CardContent>
        </Card>
      </div>

      {/* Data Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Data Flow & Security</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Data Sources</span>
              </h4>
              <ul className="space-y-1 text-sm">
                <li>• Sales transaction database</li>
                <li>• Product inventory system</li>
                <li>• Customer relationship data</li>
                <li>• Policy documentation</li>
                <li>• Operational procedures</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Security Features</span>
              </h4>
              <ul className="space-y-1 text-sm">
                <li>• Query validation and sanitization</li>
                <li>• Response content filtering</li>
                <li>• Access control and permissions</li>
                <li>• Audit logging and monitoring</li>
                <li>• Data privacy protection</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}