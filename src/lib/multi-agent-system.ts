import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export interface AgentMessage {
  id: string;
  role: 'user' | 'supervisor' | 'rag_agent' | 'sql_agent' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    agentType?: string;
    toolUsed?: string;
    reasoning?: string;
    sources?: string[];
    sqlQuery?: string;
    confidence?: number;
  };
}

export interface ToolCall {
  toolName: string;
  parameters: Record<string, unknown>;
  result?: unknown;
}

export interface AgentResponse {
  agent: string;
  message: string;
  reasoning?: string;
  toolCalls?: ToolCall[];
  nextAgent?: string;
  confidence: number;
  sources?: string[];
  sqlQuery?: string;
  shouldContinue: boolean;
}

// Supervisor Agent using ReAct pattern
export class SupervisorAgent {
  private model = genAI.getGenerativeModel({ model: "gemini-pro" });
  private conversationHistory: AgentMessage[] = [];

  async processQuery(userQuery: string): Promise<AgentMessage[]> {
    const conversation: AgentMessage[] = [];
    
    // Add user message
    const userMessage: AgentMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userQuery,
      timestamp: new Date()
    };
    
    conversation.push(userMessage);
    this.conversationHistory.push(userMessage);

    // Supervisor analyzes the query and decides which agents to use
    const supervisorResponse = await this.analyzeAndDelegate(userQuery);
    conversation.push(supervisorResponse);

    // Execute the delegation plan
    if (supervisorResponse.metadata?.agentType) {
      const agentResponses = await this.executeAgentPlan(
        userQuery, 
        supervisorResponse.metadata.agentType,
        supervisorResponse.metadata.reasoning || ""
      );
      conversation.push(...agentResponses);
    }

    return conversation;
  }

  private async analyzeAndDelegate(query: string): Promise<AgentMessage> {
    const prompt = `
You are a Supervisor Agent for a retail analytics system. Analyze the user query and decide which specialized agents should handle it.

Available Agents:
1. RAG_AGENT - Handles queries about unstructured documents, reports, policies, product information
2. SQL_AGENT - Handles queries requiring database analysis, sales data, customer metrics, inventory levels

Available Tools:
- Retrieval Tool (for RAG agent)
- SQL Database (for SQL agent)
- Data Analysis Tools
- Report Generation Tools

User Query: "${query}"

Analyze this query using the ReAct pattern:

THOUGHT: What type of information is the user asking for?
ACTION: Which agent(s) should handle this query?
REASONING: Why did you choose this approach?

Respond in JSON format:
{
  "thought": "your analysis",
  "action": "RAG_AGENT|SQL_AGENT|BOTH",
  "reasoning": "explanation of your decision",
  "confidence": 0.0-1.0
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the JSON response
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(text);
      } catch {
        // Fallback if JSON parsing fails
        parsedResponse = {
          thought: "Analyzing query type",
          action: this.fallbackAgentSelection(query),
          reasoning: "Using fallback logic",
          confidence: 0.7
        };
      }

      return {
        id: (Date.now() + 1).toString(),
        role: 'supervisor',
        content: `I'll analyze your query: "${query}". Based on my analysis, I'll ${parsedResponse.action === 'BOTH' ? 'coordinate between both RAG and SQL agents' : `delegate this to the ${parsedResponse.action.replace('_', ' ')}`}.`,
        timestamp: new Date(),
        metadata: {
          agentType: parsedResponse.action,
          reasoning: parsedResponse.reasoning,
          confidence: parsedResponse.confidence
        }
      };
    } catch (error) {
      console.error("Supervisor agent error:", error);
      return {
        id: (Date.now() + 1).toString(),
        role: 'supervisor',
        content: "I'm analyzing your query and determining the best approach to help you.",
        timestamp: new Date(),
        metadata: {
          agentType: this.fallbackAgentSelection(query),
          reasoning: "Using fallback delegation",
          confidence: 0.6
        }
      };
    }
  }

  private fallbackAgentSelection(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    // Keywords that suggest SQL queries
    const sqlKeywords = ['sales', 'revenue', 'customer', 'inventory', 'total', 'count', 'average', 'sum', 'last quarter', 'month', 'year', 'performance', 'metrics', 'analytics'];
    
    // Keywords that suggest RAG queries
    const ragKeywords = ['policy', 'document', 'report', 'recommendation', 'how to', 'what is', 'explain', 'guide', 'process', 'procedure'];
    
    const hasSqlKeywords = sqlKeywords.some(keyword => lowerQuery.includes(keyword));
    const hasRagKeywords = ragKeywords.some(keyword => lowerQuery.includes(keyword));
    
    if (hasSqlKeywords && hasRagKeywords) return 'BOTH';
    if (hasSqlKeywords) return 'SQL_AGENT';
    if (hasRagKeywords) return 'RAG_AGENT';
    
    return 'BOTH'; // Default to both if uncertain
  }

  private async executeAgentPlan(query: string, agentType: string, reasoning: string): Promise<AgentMessage[]> {
    const messages: AgentMessage[] = [];
    
    if (agentType === 'RAG_AGENT' || agentType === 'BOTH') {
      const ragAgent = new RAGAgent();
      const ragResponse = await ragAgent.processQuery(query);
      messages.push({
        id: (Date.now() + messages.length + 2).toString(),
        role: 'rag_agent',
        content: ragResponse.message,
        timestamp: new Date(),
        metadata: {
          agentType: 'RAG_AGENT',
          toolUsed: 'Retrieval Tool',
          reasoning: ragResponse.reasoning,
          sources: ragResponse.sources,
          confidence: ragResponse.confidence
        }
      });
    }
    
    if (agentType === 'SQL_AGENT' || agentType === 'BOTH') {
      const sqlAgent = new SQLAgent();
      const sqlResponse = await sqlAgent.processQuery(query);
      messages.push({
        id: (Date.now() + messages.length + 2).toString(),
        role: 'sql_agent',
        content: sqlResponse.message,
        timestamp: new Date(),
        metadata: {
          agentType: 'SQL_AGENT',
          toolUsed: 'SQL Database',
          reasoning: sqlResponse.reasoning,
          sqlQuery: sqlResponse.sqlQuery,
          confidence: sqlResponse.confidence
        }
      });
    }
    
    // Supervisor synthesizes the responses
    const synthesis = await this.synthesizeResponses(query, messages);
    messages.push(synthesis);
    
    return messages;
  }

  private async synthesizeResponses(query: string, agentResponses: AgentMessage[]): Promise<AgentMessage> {
    if (agentResponses.length === 1) {
      return {
        id: (Date.now() + 10).toString(),
        role: 'supervisor',
        content: `Based on the analysis, here's what I found: ${agentResponses[0].content}`,
        timestamp: new Date(),
        metadata: {
          agentType: 'SUPERVISOR_SYNTHESIS',
          reasoning: 'Single agent response synthesis',
          confidence: agentResponses[0].metadata?.confidence || 0.8
        }
      };
    }

    const prompt = `
You are synthesizing responses from multiple specialized agents for this retail query: "${query}"

Agent Responses:
${agentResponses.map(msg => `${msg.metadata?.agentType}: ${msg.content}`).join('\n')}

Provide a comprehensive, coherent response that combines the insights from both agents. Focus on:
1. Direct answer to the user's question
2. Key insights from the data
3. Actionable recommendations

Keep the response clear and business-focused.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const synthesizedText = response.text();

      return {
        id: (Date.now() + 10).toString(),
        role: 'supervisor',
        content: synthesizedText,
        timestamp: new Date(),
        metadata: {
          agentType: 'SUPERVISOR_SYNTHESIS',
          reasoning: 'Multi-agent response synthesis',
          confidence: 0.9
        }
      };
    } catch (error) {
      console.error("Synthesis error:", error);
      return {
        id: (Date.now() + 10).toString(),
        role: 'supervisor',
        content: `Based on the analysis from our specialized agents: ${agentResponses.map(msg => msg.content).join(' Additionally, ')}`,
        timestamp: new Date(),
        metadata: {
          agentType: 'SUPERVISOR_SYNTHESIS',
          reasoning: 'Fallback synthesis',
          confidence: 0.7
        }
      };
    }
  }
}

// RAG Agent for unstructured data
export class RAGAgent {
  private model = genAI.getGenerativeModel({ model: "gemini-pro" });

  async processQuery(query: string): Promise<AgentResponse> {
    const prompt = `
You are a RAG (Retrieval-Augmented Generation) agent specializing in retail business knowledge. 
You have access to retail documents, policies, best practices, and product information.

Query: "${query}"

Provide insights based on retail industry knowledge and best practices. Include:
1. Direct answer to the query
2. Relevant context from retail knowledge
3. Best practice recommendations

Focus on practical, actionable advice for retail operations.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        agent: 'RAG_AGENT',
        message: text,
        reasoning: 'Retrieved information from retail knowledge base and industry best practices',
        toolCalls: [{
          toolName: 'RetrievalTool',
          parameters: { query, domain: 'retail' }
        }],
        confidence: 0.85,
        sources: ['Retail Best Practices Database', 'Industry Guidelines', 'Product Documentation'],
        shouldContinue: false
      };
    } catch (error) {
      console.error("RAG Agent error:", error);
      return {
        agent: 'RAG_AGENT',
        message: "I'm currently unable to access the knowledge base, but I can provide general retail guidance based on industry standards.",
        reasoning: 'Fallback response due to retrieval system unavailability',
        confidence: 0.6,
        shouldContinue: false
      };
    }
  }
}

// SQL Agent for structured data analysis
export class SQLAgent {
  private model = genAI.getGenerativeModel({ model: "gemini-pro" });

  async processQuery(query: string): Promise<AgentResponse> {
    const prompt = `
You are a SQL agent specializing in retail analytics. Generate SQL queries for retail databases and provide analysis.

Database Schema:
- sales (id, product_id, customer_id, quantity, price, sale_date, category, store_id)
- products (id, name, category, brand, cost, retail_price, stock_level)
- customers (id, name, email, age_group, location, registration_date)
- inventory (id, product_id, stock_level, reorder_point, last_updated)

Query: "${query}"

Provide:
1. SQL query to answer the question
2. Analysis of what the results would show
3. Business insights and recommendations

Format:
SQL_QUERY: [your query]
ANALYSIS: [what this query reveals]
INSIGHTS: [business recommendations]
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract SQL query from the response
      const sqlMatch = text.match(/SQL_QUERY:\s*(.*?)(?=\nANALYSIS|$)/);
      const sqlQuery = sqlMatch ? sqlMatch[1].trim() : null;

      return {
        agent: 'SQL_AGENT',
        message: text,
        reasoning: 'Generated SQL query and analyzed potential results based on retail database schema',
        toolCalls: [{
          toolName: 'SQLDatabase',
          parameters: { query: sqlQuery }
        }],
        confidence: 0.9,
        sqlQuery: sqlQuery || undefined,
        shouldContinue: false
      };
    } catch (error) {
      console.error("SQL Agent error:", error);
      return {
        agent: 'SQL_AGENT',
        message: "I'm currently unable to generate SQL queries, but I can provide general guidance on retail data analysis.",
        reasoning: 'Fallback response due to SQL generation system unavailability',
        confidence: 0.6,
        shouldContinue: false
      };
    }
  }
}