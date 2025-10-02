'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { 
  Send, 
  Loader2, 
  TrendingUp, 
  Database,
  Bot,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  User,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { SupervisorAgent } from '../lib/multi-agent-system';

interface BusinessMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  insights?: {
    keyPoints: string[];
    recommendations: string[];
    dataSource: string;
    confidence: number;
  };
  technicalDetails?: {
    agentFlow: any[];
    sqlQuery?: string;
    sources?: string[];
    executionTime?: number;
    reasoning?: string;
  };
}

export function BusinessChatInterface() {
  const [messages, setMessages] = useState<BusinessMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [expandedTechnical, setExpandedTechnical] = useState<string | null>(null);

  const supervisorAgent = new SupervisorAgent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: BusinessMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Use LangChain ReAct agent via server-side API for better BigQuery handling
      console.log('Using LangChain ReAct agent for query:', input.trim());
      
      const response = await fetch('/api/langchain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input.trim() }),
      });

      const data = await response.json();
      
      if (data.success) {
        const langChainResult = data.result;
        
        // Format the LangChain response for business interface
        const businessResponse: BusinessMessage = {
          id: Date.now().toString(),
          type: 'assistant',
          content: langChainResult.answer,
          timestamp: new Date(),
          insights: {
            keyPoints: extractKeyPointsFromLangChain(langChainResult.answer),
            recommendations: extractRecommendationsFromLangChain(langChainResult.answer),
            dataSource: 'Live BigQuery Data (LangChain ReAct Agent)',
            confidence: 0.9
          },
          technicalDetails: {
            agentFlow: langChainResult.reasoning,
            executionTime: langChainResult.executionTime,
            reasoning: 'LangChain ReAct Agent with custom BigQuery tools'
          }
        };
        
        setMessages(prev => [...prev, businessResponse]);
      } else {
        throw new Error(data.error || 'LangChain API call failed');
      }
      
    } catch (error) {
      console.error('LangChain agent error, falling back to supervisor agent:', error);
      
      // Fallback to original agent
      try {
        const agentResponses = await supervisorAgent.processQuery(input.trim());
        const businessResponse = formatBusinessResponse(agentResponses, input.trim());
        setMessages(prev => [...prev, businessResponse]);
      } catch (fallbackError) {
        console.error('Error processing query:', fallbackError);
        const errorMessage: BusinessMessage = {
          id: Date.now().toString(),
          type: 'assistant',
          content: "I'm experiencing some technical difficulties. Please try your question again in a moment.",
          timestamp: new Date(),
          insights: {
            keyPoints: ['System temporarily unavailable'],
            recommendations: ['Please try again in a moment', 'Check your internet connection'],
            dataSource: 'System Error',
            confidence: 0
          }
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatBusinessResponse = (agentResponses: any[], originalQuery: string): BusinessMessage => {
    // Extract business insights from agent responses
    let keyPoints: string[] = [];
    let recommendations: string[] = [];
    let dataSource = 'Analysis';
    let confidence = 0.8;
    let businessContent = '';

    // Process the final synthesis response or the most comprehensive response
    const mainResponse = agentResponses.find(r => r.agent === 'SUPERVISOR_AGENT') || agentResponses[agentResponses.length - 1];
    
    if (mainResponse) {
      businessContent = extractBusinessContent(mainResponse.message);
      keyPoints = extractKeyPoints(mainResponse.message);
      recommendations = extractRecommendations(mainResponse.message);
      confidence = mainResponse.confidence || 0.8;
    }

    // Determine data source
    const sqlAgent = agentResponses.find(r => r.agent === 'SQL_AGENT');
    if (sqlAgent?.metadata?.usingRealData) {
      dataSource = 'Live BigQuery Data';
    } else if (sqlAgent) {
      dataSource = 'Retail Analytics (Demo)';
    } else {
      dataSource = 'Business Knowledge Base';
    }

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: businessContent,
      timestamp: new Date(),
      insights: {
        keyPoints,
        recommendations,
        dataSource,
        confidence
      },
      technicalDetails: {
        agentFlow: agentResponses,
        sqlQuery: sqlAgent?.sqlQuery,
        sources: mainResponse?.sources,
        executionTime: agentResponses.reduce((total, r) => total + (r.toolCalls?.[0]?.executionTime || 0), 0),
        reasoning: mainResponse?.reasoning
      }
    };
  };

  const extractBusinessContent = (message: string): string => {
    // Remove technical jargon and focus on business insights
    let content = message;
    
    // Remove SQL query sections
    content = content.replace(/SQL_QUERY:[\s\S]*?(?=ANALYSIS|INSIGHTS|RECOMMENDATIONS|$)/g, '');
    
    // Extract and format business sections
    const analysisMatch = content.match(/ANALYSIS:\s*([\s\S]*?)(?=INSIGHTS|RECOMMENDATIONS|$)/);
    const insightsMatch = content.match(/INSIGHTS:\s*([\s\S]*?)(?=RECOMMENDATIONS|$)/);
    const recommendationsMatch = content.match(/RECOMMENDATIONS:\s*([\s\S]*?)$/);
    
    let businessContent = '';
    
    if (analysisMatch) {
      businessContent += `**Analysis:**\n${analysisMatch[1].trim()}\n\n`;
    }
    
    if (insightsMatch) {
      businessContent += `**Key Insights:**\n${insightsMatch[1].trim()}\n\n`;
    }
    
    if (recommendationsMatch) {
      businessContent += `**Recommendations:**\n${recommendationsMatch[1].trim()}`;
    }
    
    // If no structured format found, clean up the original message
    if (!businessContent.trim()) {
      businessContent = content
        .replace(/Tool Used:.*$/gm, '')
        .replace(/Reasoning:.*$/gm, '')
        .replace(/Generated.*query.*$/gm, '')
        .trim();
    }
    
    return businessContent || "I've analyzed your request and can provide insights about your retail operations.";
  };

  const extractKeyPoints = (message: string): string[] => {
    const keyPoints: string[] = [];
    
    // Look for bullet points or numbered lists
    const bulletPoints = message.match(/[•\-\*]\s*([^\n]+)/g);
    if (bulletPoints) {
      keyPoints.push(...bulletPoints.map(point => point.replace(/[•\-\*]\s*/, '').trim()));
    }
    
    // Look for percentage changes or numbers
    const metrics = message.match(/\d+%|\$[\d,]+|\d+x/g);
    if (metrics) {
      keyPoints.push(`Key metrics identified: ${metrics.slice(0, 3).join(', ')}`);
    }
    
    // Default key points if none found
    if (keyPoints.length === 0) {
      keyPoints.push('Comprehensive analysis completed');
      keyPoints.push('Data-driven insights generated');
    }
    
    return keyPoints.slice(0, 4); // Limit to 4 key points
  };

  const extractKeyPointsFromLangChain = (content: string): string[] => {
    const keyPoints: string[] = [];
    
    // Extract data findings and insights
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      // Look for key insights, findings, or important statements
      if (trimmedLine.includes('performing') || 
          trimmedLine.includes('revenue') || 
          trimmedLine.includes('sales') ||
          trimmedLine.includes('growth') ||
          trimmedLine.includes('increase') ||
          trimmedLine.includes('decrease') ||
          trimmedLine.includes('trend') ||
          trimmedLine.match(/\d+(\.\d+)?[%$]/)) {
        keyPoints.push(trimmedLine.replace(/^\*\*|\*\*$/g, '').replace(/^[•\-\*\d\.\)]\s*/, ''));
      }
    }
    
    return keyPoints.slice(0, 3) || ['Performance data analyzed', 'Key trends identified'];
  };

  const extractRecommendationsFromLangChain = (content: string): string[] => {
    const recommendations: string[] = [];
    
    // Look for actionable insights
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      // Look for actionable recommendations or suggestions
      if (trimmedLine.includes('suggest') || 
          trimmedLine.includes('recommend') || 
          trimmedLine.includes('should') ||
          trimmedLine.includes('consider') ||
          trimmedLine.includes('focus') ||
          trimmedLine.includes('optimize') ||
          trimmedLine.includes('improve')) {
        recommendations.push(trimmedLine.replace(/^\*\*|\*\*$/g, '').replace(/^[•\-\*\d\.\)]\s*/, ''));
      }
    }
    
    return recommendations.slice(0, 2) || ['Monitor performance metrics', 'Focus on high-performing categories'];
  };  const extractRecommendationsFromLangChain = (content: string): string[] => {
    const recommendations: string[] = [];
    
    // Look for recommendations section
    const recommendationsMatch = content.match(/(?:recommendations|actions?|next steps?):\s*([\s\S]*?)(?:\n\n|$)/i);
    if (recommendationsMatch) {
      const recs = recommendationsMatch[1].split('\n').filter(line => line.trim().length > 0);
      recommendations.push(...recs.map(r => r.replace(/^[•\-\*\d\.\)]\s*/, '').trim()));
    }
    
    return recommendations.slice(0, 3) || ['Monitor key performance indicators', 'Review trends for strategic decisions'];
  };

  const extractRecommendations = (message: string): string[] => {
    const recommendations: string[] = [];
    
    // Look for recommendation section
    const recommendationsMatch = message.match(/RECOMMENDATIONS:\s*([\s\S]*?)$/i);
    if (recommendationsMatch) {
      const recText = recommendationsMatch[1];
      const recPoints = recText.match(/[•\-\*]\s*([^\n]+)/g);
      if (recPoints) {
        recommendations.push(...recPoints.map(point => point.replace(/[•\-\*]\s*/, '').trim()));
      }
    }
    
    // Default recommendations if none found
    if (recommendations.length === 0) {
      recommendations.push('Monitor key performance indicators regularly');
      recommendations.push('Review data trends for strategic decision making');
    }
    
    return recommendations.slice(0, 3); // Limit to 3 recommendations
  };

  const toggleTechnicalDetails = (messageId: string) => {
    setExpandedTechnical(expandedTechnical === messageId ? null : messageId);
  };

  return (
    <div className="flex flex-col h-[600px] bg-gradient-to-b from-gray-50/30 to-white border rounded-lg">
      {/* Header */}
            {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-3">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 mt-8">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <h4 className="text-lg font-medium mb-2">Welcome to Your Business Intelligence Assistant</h4>
            <p className="text-sm mb-4">Ask questions like:</p>
            <div className="space-y-2 text-sm text-left max-w-md mx-auto">
              <div className="bg-slate-50 p-2 rounded">• "What are our top selling products this month?"</div>
              <div className="bg-slate-50 p-2 rounded">• "How can we improve customer retention?"</div>
              <div className="bg-slate-50 p-2 rounded">• "Show me sales trends by category"</div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-3xl ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-100'} rounded-lg p-4`}>
              {message.type === 'user' ? (
                <p>{message.content}</p>
              ) : (
                <div>
                  {/* Business Content */}
                  <div className="prose prose-sm max-w-none">
                    {message.content.split('\n').map((line, index) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <h4 key={index} className="font-semibold mt-3 mb-2 text-slate-900">{line.replace(/\*\*/g, '')}</h4>;
                      }
                      return line.trim() ? <p key={index} className="mb-2 text-slate-700">{line}</p> : null;
                    })}
                  </div>

                  {/* Business Insights Panel */}
                  {message.insights && (
                    <div className="mt-4 bg-white border rounded-lg p-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-slate-900 mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Key Points
                          </h5>
                          <ul className="text-sm text-slate-600 space-y-1">
                            {message.insights.keyPoints.map((point, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-slate-900 mb-2">Recommendations</h5>
                          <ul className="text-sm text-slate-600 space-y-1">
                            {message.insights.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs text-slate-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Database className="w-3 h-3" />
                            {message.insights.dataSource}
                          </span>
                          <span>Confidence: {Math.round(message.insights.confidence * 100)}%</span>
                        </div>
                        {showTechnicalDetails && message.technicalDetails && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleTechnicalDetails(message.id)}
                            className="text-xs flex items-center gap-1"
                          >
                            {expandedTechnical === message.id ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            Technical Details
                          </Button>
                        )}
                      </div>

                      {/* Technical Details (Collapsible) */}
                      {showTechnicalDetails && expandedTechnical === message.id && message.technicalDetails && (
                        <div className="mt-4 p-3 bg-slate-50 rounded text-xs text-slate-600 border-t">
                          <div className="space-y-2">
                            <div><strong>Execution Time:</strong> {message.technicalDetails.executionTime}ms</div>
                            {message.technicalDetails.sqlQuery && (
                              <div>
                                <strong>SQL Query:</strong>
                                <pre className="mt-1 p-2 bg-slate-100 rounded text-xs overflow-x-auto">
                                  {message.technicalDetails.sqlQuery}
                                </pre>
                              </div>
                            )}
                            <div><strong>Agent Flow:</strong> {message.technicalDetails.agentFlow.map(r => r.agent).join(' → ')}</div>
                            {message.technicalDetails.sources && (
                              <div><strong>Sources:</strong> {message.technicalDetails.sources.join(', ')}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing your query and gathering insights...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-slate-50">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your retail business... (e.g., 'What are our top selling products?')"
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}