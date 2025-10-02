'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Send, 
  Loader2, 
  TrendingUp, 
  Database,
  User,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
interface BusinessInsights {
  keyPoints: string[];
  recommendations: string[];
  dataSource: string;
  confidence: number;
}

interface TechnicalDetails {
  executionTime: number;
  sqlQuery?: string;
  agentFlow: Array<{
    agent: string;
    action: string;
    result: any;
  }>;
  sources?: string[];
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  insights?: BusinessInsights;
  technicalDetails?: TechnicalDetails;
}

const exampleQuestions = [
  "What are our top selling products this month?",
  "How can we improve customer retention?",
  "Show me sales trends by category",
  "Which products have the highest profit margins?",
  "What are our inventory turnover rates?"
];

interface BusinessChatInterfaceProps {
  onNavigationToggle?: () => void;
}

export function BusinessChatInterface({ onNavigationToggle }: BusinessChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const extractBusinessInsights = (response: string): BusinessInsights => {
    const lines = response.split('\n').filter(line => line.trim());
    const keyPoints: string[] = [];
    const recommendations: string[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.includes('increased') || trimmed.includes('decreased') || 
          trimmed.includes('highest') || trimmed.includes('lowest') ||
          trimmed.includes('%') || trimmed.includes('$')) {
        keyPoints.push(trimmed);
      }
      if (trimmed.includes('should') || trimmed.includes('recommend') || 
          trimmed.includes('consider') || trimmed.includes('focus on')) {
        recommendations.push(trimmed);
      }
    });

    // Calculate dynamic confidence based on response quality
    let confidence = 0.6; // Base confidence
    
    // Increase confidence based on data indicators
    const dataIndicators = (response.match(/\$[\d,]+|\d+%|\d+\.\d+|\d{1,3}(,\d{3})*/g) || []).length;
    confidence += Math.min(dataIndicators * 0.05, 0.25); // Up to +25% for data
    
    // Increase confidence for structured content
    if (keyPoints.length > 0) confidence += 0.1;
    if (recommendations.length > 0) confidence += 0.1;
    
    // Increase confidence for longer, detailed responses
    const wordCount = response.split(/\s+/).length;
    if (wordCount > 50) confidence += 0.05;
    if (wordCount > 100) confidence += 0.05;
    
    // Decrease confidence for short or generic responses
    if (wordCount < 20) confidence -= 0.2;
    if (response.toLowerCase().includes('sorry') || response.toLowerCase().includes('error')) {
      confidence -= 0.3;
    }
    
    // Cap confidence between 0.4 and 0.95
    confidence = Math.max(0.4, Math.min(0.95, confidence));

    return {
      keyPoints: keyPoints.slice(0, 3),
      recommendations: recommendations.slice(0, 2),
      dataSource: 'Live BigQuery Data',
      confidence: confidence
    };
  };

  const formatBusinessResponse = (response: string): string => {
    // Clean up the response and format it better
    return response
      .replace(/\*\*/g, '')
      .replace(/#+\s*/g, '')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const startTime = Date.now();
      
      const response = await fetch('/api/langchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input.trim()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const executionTime = Date.now() - startTime;
      
      const formattedResponse = formatBusinessResponse(result.response || result.output || 'No response received');
      const insights = extractBusinessInsights(result.response || result.output || '');

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: formattedResponse,
        timestamp: new Date(),
        insights,
        technicalDetails: {
          executionTime,
          agentFlow: result.intermediateSteps || []
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an issue analyzing your request. Please try rephrasing your question or contact support if the problem persists.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onNavigationToggle && (
              <button
                onClick={onNavigationToggle}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Data Agent</h1>
              <p className="text-slate-600 mt-1">Ask questions about your retail operations and get insights from live BigQuery data</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Live Data Connected</span>
            </div>
            <span className="text-sm text-slate-500">BigQuery: dce-gcp-training.thelook_ecommerce</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Welcome to your AI Business Assistant</h3>
              <p className="text-slate-600 mb-6">Ask me anything about your retail business data</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {exampleQuestions.slice(0, 3).map((question) => (
                  <button
                    key={question}
                    onClick={() => setInput(question)}
                    className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    disabled={isLoading}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className="flex gap-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {message.type === 'user' ? (
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                {message.type === 'user' ? (
                  <div className="bg-blue-500 text-white rounded-2xl rounded-tl-md px-6 py-3 inline-block">
                    <p className="text-base">{message.content}</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl rounded-tl-md border border-slate-200 shadow-sm p-6">
                    {/* Format the response content with better structure */}
                    <div className="prose prose-slate max-w-none">
                      {message.content.split('\n').map((line, index) => {
                        if (line.trim() === '') return null;
                        
                        // Check if line looks like a header/title
                        if (line.includes(':') && line.length < 100) {
                          return (
                            <h4 key={index} className="text-lg font-semibold text-slate-900 mt-4 mb-2 first:mt-0">
                              {line.replace(':', '')}
                            </h4>
                          );
                        }
                        
                        // Check if line is a bullet point or starts with number
                        if (line.match(/^[\d\-\*•]\s/) || line.trim().startsWith('-')) {
                          return (
                            <div key={index} className="flex items-start gap-2 mb-2">
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2.5 flex-shrink-0"></span>
                              <p className="text-slate-700 leading-relaxed">{line.replace(/^[\d\-\*•]\s*/, '')}</p>
                            </div>
                          );
                        }
                        
                        // Regular paragraph
                        return (
                          <p key={index} className="text-slate-700 leading-relaxed mb-3">
                            {line}
                          </p>
                        );
                      })}
                    </div>
                    
                    {message.insights && (
                      <div className="mt-6 pt-6 border-t border-slate-100">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Key Insights */}
                          {message.insights.keyPoints.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="h-5 w-5 text-emerald-500" />
                                <h5 className="font-semibold text-slate-900">Key Insights</h5>
                              </div>
                              <div className="space-y-2">
                                {message.insights.keyPoints.slice(0, 5).map((point, index) => (
                                  <div key={index} className="flex items-start gap-2 p-3 bg-emerald-50 rounded-lg">
                                    <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-emerald-800 font-medium">{point}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recommendations */}
                          {message.insights.recommendations.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="h-5 w-5 text-amber-500" />
                                <h5 className="font-semibold text-slate-900">Recommendations</h5>
                              </div>
                              <div className="space-y-2">
                                {message.insights.recommendations.slice(0, 5).map((rec, index) => (
                                  <div key={index} className="p-3 bg-amber-50 rounded-lg">
                                    <span className="text-sm text-amber-800 font-medium">{rec}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Footer */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 text-sm text-slate-500">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Database className="h-4 w-4" />
                              Live BigQuery Data
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>{Math.round(message.insights.confidence * 100)}% confidence</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-md border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-slate-600">Analyzing your data and generating insights...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="bg-white border-t border-slate-200 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
              placeholder="Ask about your retail business..."
              className="w-full px-6 py-4 pr-14 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-slate-50 focus:bg-white transition-colors"
              disabled={isLoading}
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white rounded-xl flex items-center justify-center transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Suggestions */}
          {messages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {exampleQuestions.slice(0, 3).map((question) => (
                <button
                  key={question}
                  onClick={() => setInput(question)}
                  className="px-3 py-2 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  {question}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}