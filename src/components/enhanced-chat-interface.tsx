"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Brain, Database, FileText, Zap } from "lucide-react";
import { SupervisorAgent, type AgentMessage } from "@/lib/multi-agent-system";
import { cn } from "@/lib/utils";

interface ChatStep {
  id: string;
  agent: string;
  content: string;
  type: 'user' | 'supervisor' | 'rag_agent' | 'sql_agent' | 'system';
  timestamp: Date;
  metadata?: {
    reasoning?: string;
    toolUsed?: string;
    confidence?: number;
    sources?: string[];
    sqlQuery?: string;
  };
}

export function EnhancedChatInterface() {
  const [messages, setMessages] = useState<ChatStep[]>([
    {
      id: "1",
      agent: "Supervisor Agent",
      content: "Hello! I'm your Retail Insights Supervisor Agent. I coordinate between specialized RAG and SQL agents to provide comprehensive answers to your business questions. What would you like to know?",
      type: 'supervisor',
      timestamp: new Date(),
      metadata: { confidence: 1.0 }
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supervisorAgent = new SupervisorAgent();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'supervisor': return <Brain className="w-4 h-4 text-blue-600" />;
      case 'rag_agent': return <FileText className="w-4 h-4 text-green-600" />;
      case 'sql_agent': return <Database className="w-4 h-4 text-purple-600" />;
      case 'user': return <User className="w-4 h-4 text-gray-600" />;
      default: return <Bot className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAgentColor = (type: string) => {
    switch (type) {
      case 'supervisor': return 'bg-blue-50 border-blue-200';
      case 'rag_agent': return 'bg-green-50 border-green-200';
      case 'sql_agent': return 'bg-purple-50 border-purple-200';
      case 'user': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getAgentName = (type: string) => {
    switch (type) {
      case 'supervisor': return 'Supervisor Agent';
      case 'rag_agent': return 'RAG Agent';
      case 'sql_agent': return 'SQL Agent';
      case 'user': return 'You';
      default: return 'System';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: ChatStep = {
      id: Date.now().toString(),
      agent: "User",
      content: input,
      type: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);
    setCurrentStep("Supervisor Agent is analyzing your query...");

    try {
      // Process through the multi-agent system
      const agentResponses = await supervisorAgent.processQuery(input);
      
      // Convert AgentMessage[] to ChatStep[]
      const chatSteps: ChatStep[] = agentResponses.map(response => ({
        id: response.id,
        agent: getAgentName(response.role),
        content: response.content,
        type: response.role,
        timestamp: response.timestamp,
        metadata: response.metadata
      }));

      // Add messages with delays to show the flow
      for (let i = 0; i < chatSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay between agents
        
        setCurrentStep(`${getAgentName(chatSteps[i].type)} is working...`);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setMessages(prev => [...prev, chatSteps[i]]);
        setCurrentStep("");
      }
      
    } catch (error) {
      console.error("Error in multi-agent processing:", error);
      const errorMessage: ChatStep = {
        id: (Date.now() + 1).toString(),
        agent: "System",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        type: 'system',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      setCurrentStep("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[700px]">
      {/* Agent Flow Visualization */}
      <div className="bg-gray-50 border-b p-4">
        <div className="flex items-center justify-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", 
              isProcessing && currentStep.includes("Supervisor") ? "bg-blue-500 animate-pulse" : "bg-blue-100")}>
              <Brain className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-medium">Supervisor</span>
          </div>
          
          <div className="flex-1 border-t border-dashed border-gray-300"></div>
          
          <div className="flex items-center space-x-2">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center",
              isProcessing && currentStep.includes("RAG") ? "bg-green-500 animate-pulse" : "bg-green-100")}>
              <FileText className="w-4 h-4 text-green-600" />
            </div>
            <span className="font-medium">RAG Agent</span>
          </div>
          
          <div className="flex-1 border-t border-dashed border-gray-300"></div>
          
          <div className="flex items-center space-x-2">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center",
              isProcessing && currentStep.includes("SQL") ? "bg-purple-500 animate-pulse" : "bg-purple-100")}>
              <Database className="w-4 h-4 text-purple-600" />
            </div>
            <span className="font-medium">SQL Agent</span>
          </div>
        </div>
        
        {currentStep && (
          <div className="text-center mt-2 text-sm text-gray-600 flex items-center justify-center">
            <Zap className="w-4 h-4 mr-2 animate-pulse" />
            {currentStep}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            {/* Agent Header */}
            <div className="flex items-center space-x-2 text-sm">
              {getAgentIcon(message.type)}
              <span className="font-medium text-gray-700">{message.agent}</span>
              {message.metadata?.confidence && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                  Confidence: {(message.metadata.confidence * 100).toFixed(0)}%
                </span>
              )}
            </div>

            {/* Message Content */}
            <div className={cn(
              "p-4 rounded-lg border-l-4",
              getAgentColor(message.type)
            )}>
              <div className="text-sm leading-relaxed">{message.content}</div>
              
              {/* Metadata */}
              {message.metadata && (
                <div className="mt-3 space-y-2">
                  {message.metadata.reasoning && (
                    <div className="text-xs bg-white/50 p-2 rounded">
                      <strong>Reasoning:</strong> {message.metadata.reasoning}
                    </div>
                  )}
                  
                  {message.metadata.toolUsed && (
                    <div className="text-xs flex items-center space-x-2">
                      <Zap className="w-3 h-3" />
                      <span><strong>Tool Used:</strong> {message.metadata.toolUsed}</span>
                    </div>
                  )}
                  
                  {message.metadata.sqlQuery && (
                    <div className="text-xs bg-gray-800 text-green-400 p-2 rounded font-mono">
                      <strong>SQL Query:</strong><br />
                      <code>{message.metadata.sqlQuery}</code>
                    </div>
                  )}
                  
                  {message.metadata.sources && message.metadata.sources.length > 0 && (
                    <div className="text-xs">
                      <strong>Sources:</strong> {message.metadata.sources.join(", ")}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4 bg-white">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your retail business... (e.g., 'What were our top selling products last quarter?' or 'What's our return policy for shoes?')"
            className="flex-1 min-h-[60px] max-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
            disabled={isProcessing}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            size="sm"
            className="self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Example Queries */}
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={() => setInput("What were our total sales last quarter?")}
            className="text-xs bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-full text-blue-700 transition-colors"
            disabled={isProcessing}
          >
            Sales Analysis
          </button>
          <button
            onClick={() => setInput("What's our inventory turnover rate?")}
            className="text-xs bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-full text-purple-700 transition-colors"
            disabled={isProcessing}
          >
            Inventory Metrics
          </button>
          <button
            onClick={() => setInput("What are the best practices for customer retention?")}
            className="text-xs bg-green-50 hover:bg-green-100 px-2 py-1 rounded-full text-green-700 transition-colors"
            disabled={isProcessing}
          >
            Best Practices
          </button>
        </div>
      </div>
    </div>
  );
}