import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

export interface RetailQuery {
  question: string;
  context?: string;
  type: 'rag' | 'text-to-sql' | 'general';
}

export interface RetailResponse {
  answer: string;
  confidence: number;
  sources?: string[];
  sqlQuery?: string;
  data?: Record<string, unknown>[];
}

export class RetailAgentService {
  private model = genAI.getGenerativeModel({ model: "gemini-pro" });

  async processQuery(query: RetailQuery): Promise<RetailResponse> {
    try {
      let prompt = "";
      
      if (query.type === 'text-to-sql') {
        prompt = this.buildSqlPrompt(query.question);
      } else if (query.type === 'rag') {
        prompt = this.buildRagPrompt(query.question, query.context);
      } else {
        prompt = this.buildGeneralPrompt(query.question);
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseResponse(text, query.type);
    } catch (error) {
      console.error("Error processing query:", error);
      return {
        answer: "I'm sorry, I encountered an error processing your request. Please try again.",
        confidence: 0
      };
    }
  }

  private buildSqlPrompt(question: string): string {
    return `
You are a retail analytics expert. Given the following question about retail data, generate a SQL query and provide insights.

Database Schema:
- sales (id, product_id, customer_id, quantity, price, sale_date, category)
- products (id, name, category, brand, cost, retail_price)
- customers (id, name, email, age_group, location)
- inventory (id, product_id, stock_level, reorder_point, last_updated)

Question: ${question}

Please provide:
1. A SQL query to answer the question
2. An explanation of the results
3. Key insights for business decision making

Format your response as:
SQL_QUERY: [your SQL query here]
EXPLANATION: [explanation of results]
INSIGHTS: [business insights]
`;
  }

  private buildRagPrompt(question: string, context?: string): string {
    return `
You are a retail business analyst. Using the provided context from retail documents, answer the following question.

Context: ${context || "No specific context provided"}

Question: ${question}

Please provide:
1. A comprehensive answer based on the context
2. Key insights and recommendations
3. Any relevant trends or patterns

Answer:
`;
  }

  private buildGeneralPrompt(question: string): string {
    return `
You are a retail business expert specializing in fashion retail (bags, shirts, shoes, etc.). Answer the following question with actionable insights.

Question: ${question}

Please provide practical advice and insights relevant to retail business operations.
`;
  }

  private parseResponse(text: string, type: string): RetailResponse {
    const confidence = 0.85; // Mock confidence score
    
    if (type === 'text-to-sql') {
      const sqlMatch = text.match(/SQL_QUERY:\s*(.*?)(?=\n|EXPLANATION:|$)/);
      const sqlQuery = sqlMatch ? sqlMatch[1].trim() : null;
      
      return {
        answer: text,
        confidence,
        sqlQuery: sqlQuery || undefined
      };
    }
    
    return {
      answer: text,
      confidence
    };
  }

  // Mock method to simulate database query execution
  async executeQuery(_sqlQuery: string): Promise<Record<string, unknown>[]> {
    // In a real implementation, this would execute against your database
    // For now, return mock data
    return [
      { metric: "Total Sales", value: "$2.5M", change: "+10%" },
      { metric: "Customer Engagement", value: "45%", change: "-5%" },
      { metric: "Inventory Level", value: "80%", change: "+2%" }
    ];
  }
}