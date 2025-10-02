import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { BaseMessage } from "@langchain/core/messages";
import { BigQuery } from "@google-cloud/bigquery";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * LangGraph-based BigQuery Agent using proper SQL toolkit pattern
 * Following the pattern from: https://langchain-ai.github.io/langgraph/tutorials/sql/sql-agent/
 */
export class LangChainBigQueryAgent {
  private llm: ChatGoogleGenerativeAI;
  private bigQueryClient: BigQuery;
  private agent: any = null;
  private projectId: string;
  private datasetId: string;

  constructor() {
    this.projectId = process.env.BIGQUERY_PROJECT_ID!;
    this.datasetId = process.env.BIGQUERY_DATASET_ID || 'thelook_ecommerce';

    // Initialize the LLM
    this.llm = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      temperature: 0.1,
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    });

    // Initialize BigQuery client
    this.bigQueryClient = new BigQuery({
      projectId: this.projectId,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  }

  /**
   * Initialize the SQL database connection and agent
   */
  async initialize(): Promise<void> {
    try {
      // Create the SQL toolkit tools for BigQuery
      const tools = this.createSQLToolkit();

      // Create system prompt following the LangGraph pattern
      const systemPrompt = `
You are a business intelligence assistant specialized in retail analytics with access to a BigQuery SQL database.

WORKFLOW - Follow this EXACT order and STOP after step 5:
1. ALWAYS start by calling sql_db_list_tables to see available tables
2. Call sql_db_schema to get schema for 1-2 relevant tables only
3. Write ONE simple, optimized SQL query
4. Use sql_db_query_checker to validate your SQL
5. Execute with sql_db_query and provide business insights - THEN STOP

DATABASE INFO:
- Dialect: BigQuery SQL
- Dataset: ${this.projectId}.${this.datasetId}
- Large tables: events, order_items, users (require optimization)
- Limit results to 10 rows unless specified otherwise
- Use proper BigQuery syntax (backticks for table names, etc.)

CRITICAL QUERY RULES:
- For events table: AVOID querying events directly - it's too large
- Instead, use order_items or users table for traffic analysis
- For large tables (order_items, users), ALWAYS add:
  * WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
  * LIMIT 10
- Keep queries simple - no complex JOINs across large tables
- Use TABLESAMPLE SYSTEM (1 PERCENT) for large aggregations
- If a query fails with "bytes billed" error, switch to smaller tables

RESPONSE RULES:
- Provide SHORT, BUSINESS-FOCUSED responses (2-3 sentences max)
- Lead with KEY FINDINGS and NUMBERS
- End with 1-2 ACTIONABLE RECOMMENDATIONS
- Use executive language, not technical jargon
- DO NOT ask follow-up questions - provide the analysis and STOP

STOP CONDITIONS:
- After providing business insights from query results
- After encountering an error (provide business context instead)
- Do NOT continue querying or asking for more information

Keep responses concise and executive-ready.`;

      // Create the ReAct agent with SQL toolkit tools
      this.agent = createReactAgent({
        llm: this.llm,
        tools: tools,
        messageModifier: systemPrompt,
        checkpointSaver: undefined, // Disable checkpointing for simplicity
      });
      
    } catch (error) {
      console.error('Failed to initialize LangChain BigQuery Agent:', error);
      throw error;
    }
  }

  /**
   * Create SQL toolkit tools following the standard pattern
   */
  private createSQLToolkit(): DynamicStructuredTool[] {
    // sql_db_list_tables tool
    const listTablesTool = new DynamicStructuredTool({
      name: "sql_db_list_tables",
      description: "Input is an empty string, output is a comma-separated list of tables in the database.",
      schema: z.object({}),
      func: async () => {
        try {
          const [tables] = await this.bigQueryClient.dataset(this.datasetId).getTables();
          const tableNames = tables.map(t => t.id).join(', ');
          return tableNames;
        } catch (error) {
          console.error('Error listing tables:', error);
          return `Unable to list tables: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      },
    });

    // sql_db_schema tool
    const schemaInfoTool = new DynamicStructuredTool({
      name: "sql_db_schema",
      description: "Input to this tool is a comma-separated list of tables, output is the schema and sample rows for those tables. Be sure that the tables actually exist by calling sql_db_list_tables first!",
      schema: z.object({
        table_names: z.string().describe("Comma-separated list of table names to get schema for"),
      }),
      func: async ({ table_names }) => {
        try {
          const tableList = table_names.split(',').map(name => name.trim());
          const [allTables] = await this.bigQueryClient.dataset(this.datasetId).getTables();
          
          let schemaInfo = '';
          
          for (const requestedTable of tableList) {
            const table = allTables.find(t => t.id === requestedTable);
            if (!table) {
              schemaInfo += `Table ${requestedTable} not found.\n\n`;
              continue;
            }

            try {
              const [metadata] = await table.getMetadata();
              const tableId = table.id!;
              
              schemaInfo += `\nCREATE TABLE \`${this.projectId}.${this.datasetId}.${tableId}\` (\n`;
              
              if (metadata.schema && metadata.schema.fields) {
                const fieldDescriptions = metadata.schema.fields.map((field: any) => {
                  const nullable = field.mode === 'NULLABLE' ? '' : ' NOT NULL';
                  return `    \`${field.name}\` ${field.type}${nullable}`;
                });
                schemaInfo += fieldDescriptions.join(',\n');
              }
              
              schemaInfo += `\n);\n\n`;
              
              // Get sample data
              try {
                const sampleQuery = `SELECT * FROM \`${this.projectId}.${this.datasetId}.${tableId}\` LIMIT 3`;
                const [job] = await this.bigQueryClient.createQueryJob({
                  query: sampleQuery,
                  location: 'US',
                  maximumBytesBilled: '5000000', // 5MB limit for sampling
                });
                
                const [sampleRows] = await job.getQueryResults();
                if (sampleRows.length > 0) {
                  schemaInfo += `/*\n${sampleRows.length} rows from ${tableId} table:\n`;
                  const headers = Object.keys(sampleRows[0]);
                  schemaInfo += headers.join('\t') + '\n';
                  
                  sampleRows.forEach((row: any) => {
                    const values = headers.map(h => {
                      const val = row[h];
                      if (val === null || val === undefined) return 'NULL';
                      if (typeof val === 'string' && val.length > 20) return val.substring(0, 20) + '...';
                      return String(val);
                    });
                    schemaInfo += values.join('\t') + '\n';
                  });
                  schemaInfo += '*/\n\n';
                }
              } catch (sampleError) {
                schemaInfo += `/* Sample data unavailable for ${tableId} */\n\n`;
              }
              
            } catch (error) {
              schemaInfo += `/* Error loading schema for ${requestedTable} */\n\n`;
            }
          }
          
          return schemaInfo;
        } catch (error) {
          console.error('Error getting schema info:', error);
          return `Unable to retrieve schema information: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      },
    });

    // sql_db_query_checker tool
    const queryCheckerTool = new DynamicStructuredTool({
      name: "sql_db_query_checker", 
      description: "Use this tool to double check if your query is correct before executing it. Always use this tool before executing a query with sql_db_query!",
      schema: z.object({
        query: z.string().describe("The SQL query to check"),
      }),
      func: async ({ query }) => {
        try {
          // For BigQuery, we'll do some basic validation and return the formatted query
          // Check for dangerous operations
          const upperQuery = query.toUpperCase();
          const dangerousOps = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'CREATE', 'ALTER', 'TRUNCATE'];
          
          for (const op of dangerousOps) {
            if (upperQuery.includes(op)) {
              return `DANGER: Query contains potentially dangerous operation: ${op}. Only SELECT queries are allowed.`;
            }
          }
          
          // Basic syntax check - ensure it's a SELECT query
          if (!upperQuery.trim().startsWith('SELECT')) {
            return `Query should start with SELECT. Current query: ${query}`;
          }
          
          // Return the query as valid
          return `\`\`\`sql\n${query}\n\`\`\``;
        } catch (error) {
          return `Query validation error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      },
    });

    // sql_db_query tool
    const executeQueryTool = new DynamicStructuredTool({
      name: "sql_db_query",
      description: "Input to this tool is a detailed and correct SQL query, output is a result from the database. If the query is not correct, an error message will be returned. If an error is returned, rewrite the query, check the query, and try again.",
      schema: z.object({
        query: z.string().describe("The SQL query to execute"),
      }),
      func: async ({ query }) => {
        try {
          console.log('LangChain executing BigQuery:', query);
          
          // Use optimized query execution with lower limits
          const [job] = await this.bigQueryClient.createQueryJob({
            query: query,
            location: 'US',
            maximumBytesBilled: '5000000', // 5MB limit to prevent expensive queries
            jobTimeoutMs: 30000, // 30 second timeout
          });
          
          const [rows] = await job.getQueryResults();
          
          if (rows.length === 0) {
            return 'Query executed successfully but returned no results.';
          }
          
          // Format results in the expected pattern
          const headers = Object.keys(rows[0]);
          let result = `Query returned ${rows.length} rows:\n`;
          
          const maxRows = Math.min(rows.length, 5); // Limit to 5 rows for faster processing
          for (let i = 0; i < maxRows; i++) {
            const row = rows[i];
            const rowData = headers.map(header => {
              const value = row[header];
              if (value === null || value === undefined) return 'NULL';
              if (typeof value === 'string' && value.length > 50) return value.substring(0, 50) + '...';
              return String(value);
            });
            
            result += `Row ${i + 1}: ${headers.map((h, idx) => `${h}=${rowData[idx]}`).join(', ')}\n`;
          }
          
          if (rows.length > 5) {
            result += `... and ${rows.length - 5} more rows\n`;
          }
          
          return result;
          
        } catch (error) {
          console.error('BigQuery execution error:', error);
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          
          // Provide more specific error guidance
          if (errorMsg.includes('bytes billed')) {
            return `Query execution failed: Query too expensive. Please use smaller tables like 'order_items' or 'users' instead of 'events' table. Add recent date filters (e.g., WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)) and use LIMIT 10.`;
          }
          
          if (errorMsg.includes('TABLESAMPLE') || errorMsg.includes('Expected end of input but got keyword AS')) {
            return `Query execution failed: TABLESAMPLE syntax error. The correct syntax is: FROM table_name TABLESAMPLE SYSTEM (1 PERCENT) AS alias. Please rewrite the query without TABLESAMPLE and use LIMIT 10 instead for sampling.`;
          }
          
          if (errorMsg.includes('Syntax error')) {
            return `Query execution failed with syntax error: ${errorMsg}. Please review the SQL syntax and rewrite the query. Focus on basic SELECT, FROM, WHERE, GROUP BY, ORDER BY clauses.`;
          }
          
          // Return a helpful error message that discourages further attempts
          return `Query execution failed: ${errorMsg}. Please try a simpler approach with basic SQL syntax and smaller result sets (LIMIT 10).`;
        }
      },
    });

    return [listTablesTool, schemaInfoTool, queryCheckerTool, executeQueryTool];
  }

  /**
   * Process a business query using the LangChain ReAct agent
   */
  async processQuery(query: string): Promise<{
    answer: string;
    reasoning: string[];
    sqlQuery?: string;
    results?: any[];
    executionTime: number;
  }> {
    if (!this.agent) {
      await this.initialize();
    }

    const startTime = Date.now();
    
    try {
      // Enhanced prompt for business context with clearer instructions
      const enhancedQuery = `
Business Question: ${query}

IMPORTANT: Follow this exact workflow and STOP after providing the final answer:
1. Use sql_db_list_tables to see available tables
2. Use sql_db_schema for 1-2 relevant tables only
3. Write a simple, optimized SQL query
4. Use sql_db_query_checker to validate your query
5. Execute with sql_db_query
6. Provide a SHORT business answer (2-3 sentences) and STOP

For large tables (events, order_items, users), ALWAYS include:
- Recent date filters: WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
- LIMIT clause to keep results small

Keep queries simple and focused. Provide business insights, not technical details.
`;

      // Execute the agent with increased recursion limit
      const result = await this.agent.invoke(
        {
          messages: [{ role: "user", content: enhancedQuery }],
        },
        {
          recursionLimit: 15, // Reduced from default 25 to prevent loops
          maxConcurrency: 1,  // Limit concurrency
        }
      );

      const executionTime = Date.now() - startTime;

      // Extract information from the agent response
      const lastMessage = result.messages[result.messages.length - 1];
      const answer = lastMessage.content || "I was unable to process your query successfully.";

      // Extract reasoning from intermediate messages
      const reasoning = result.messages
        .filter((msg: BaseMessage) => msg._getType() === 'ai')
        .map((msg: BaseMessage) => msg.content)
        .slice(-3); // Keep only last 3 reasoning steps

      return {
        answer,
        reasoning,
        executionTime,
      };

    } catch (error) {
      console.error('LangChain BigQuery Agent error:', error);
      
      // Handle specific recursion error
      if (error instanceof Error && error.message.includes('recursion limit')) {
        return {
          answer: "I encountered a complexity issue while analyzing your request. Let me provide a simplified analysis: For traffic source analysis, I recommend focusing on the top 3-5 sources and examining their performance over the last 7 days to identify any unusual patterns or significant changes.",
          reasoning: ['Query too complex, hitting recursion limit'],
          executionTime: Date.now() - startTime,
        };
      }
      
      return {
        answer: "I encountered an issue while analyzing your request. This might be due to BigQuery connection issues or query complexity. For traffic source analysis, I recommend examining recent data patterns and comparing current metrics with historical averages to identify anomalies.",
        reasoning: [`Error: ${error instanceof Error ? error.message : 'Unknown error'}`],
        executionTime: Date.now() - startTime,
      };
    }
  }
}

// Singleton instance
let langChainAgent: LangChainBigQueryAgent | null = null;

export function getLangChainBigQueryAgent(): LangChainBigQueryAgent {
  if (!langChainAgent) {
    langChainAgent = new LangChainBigQueryAgent();
  }
  return langChainAgent;
}

export async function createLangChainBigQueryAgent() {
  const agent = getLangChainBigQueryAgent();
  await agent.initialize();
  return agent;
}