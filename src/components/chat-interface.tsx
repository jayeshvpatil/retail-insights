"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, Bot, User } from "lucide-react";
import { RetailAgentService, type RetailQuery } from "@/lib/retail-agent";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender: "user" | "agent";
  timestamp: Date;
  isLoading?: boolean;
  sources?: string[];
  sqlQuery?: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hi there! I'm here to help you with your retail data questions. What would you like to know?",
      sender: "agent",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const retailAgent = new RetailAgentService();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    };

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "I'm generating the answer to your question. Please wait a moment...",
      sender: "agent",
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Determine query type based on content
      let queryType: RetailQuery["type"] = "general";
      const lowerInput = input.toLowerCase();
      
      if (lowerInput.includes("sql") || lowerInput.includes("database") || lowerInput.includes("query")) {
        queryType = "text-to-sql";
      } else if (lowerInput.includes("document") || lowerInput.includes("report")) {
        queryType = "rag";
      }

      const query: RetailQuery = {
        question: input,
        type: queryType,
      };

      const response = await retailAgent.processQuery(query);
      
      const agentMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: response.answer,
        sender: "agent",
        timestamp: new Date(),
        sources: response.sources,
        sqlQuery: response.sqlQuery,
      };

      setMessages(prev => prev.slice(0, -1).concat(agentMessage));
    } catch (error) {
      console.error("Error processing query:", error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: "I'm sorry, I encountered an error. Please try again.",
        sender: "agent",
        timestamp: new Date(),
      };

      setMessages(prev => prev.slice(0, -1).concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.sender === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.sender === "agent" && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div
              className={cn(
                "max-w-[70%] rounded-lg px-4 py-2",
                message.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-900"
              )}
            >
              <div className="text-sm">{message.content}</div>
              
              {message.sqlQuery && (
                <div className="mt-2 p-2 bg-gray-800 text-green-400 rounded text-xs font-mono">
                  <div className="font-semibold mb-1">Generated SQL:</div>
                  <div>{message.sqlQuery}</div>
                </div>
              )}
              
              {message.sources && message.sources.length > 0 && (
                <div className="mt-2 text-xs opacity-75">
                  Sources: {message.sources.join(", ")}
                </div>
              )}
            </div>
            
            {message.sender === "user" && (
              <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question..."
            className="flex-1 min-h-[40px] max-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}