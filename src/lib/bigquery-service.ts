import { BigQuery } from '@google-cloud/bigquery';

export interface BigQueryConfig {
  projectId: string;
  datasetId: string;
  keyFilename?: string;
  credentials?: object;
}

export interface QueryResult {
  rows: Record<string, unknown>[];
  schema: Array<{
    name: string;
    type: string;
    mode: string;
  }>;
  totalRows: number;
  executionTime: number;
}

export class BigQueryService {
  private client: BigQuery;
  private config: BigQueryConfig;

  constructor(config: BigQueryConfig) {
    this.config = config;
    
    // Initialize BigQuery client with configuration
    const clientConfig: any = {
      projectId: config.projectId,
    };

    if (config.keyFilename) {
      clientConfig.keyFilename = config.keyFilename;
    } else if (config.credentials) {
      clientConfig.credentials = config.credentials;
    }

    this.client = new BigQuery(clientConfig);
  }

  async executeQuery(sqlQuery: string): Promise<QueryResult> {
    const startTime = Date.now();
    
    try {
      // Basic query sanitization and optimization
      const cleanQuery = this.optimizeQueryForLargeTables(this.sanitizeQuery(sqlQuery));
      
      const options = {
        query: cleanQuery,
        location: 'US',
        maximumBytesBilled: '10000000', // 10MB limit - much more conservative
      };

      const [job] = await this.client.createQueryJob(options);
      const [rows] = await job.getQueryResults();
      
      // Get schema information
      const metadata = job.metadata;
      const schema = metadata?.statistics?.query?.schema?.fields || [];
      
      const executionTime = Date.now() - startTime;

      return {
        rows: rows as Record<string, unknown>[],
        schema: schema.map((field: any) => ({
          name: field.name,
          type: field.type,
          mode: field.mode || 'NULLABLE'
        })),
        totalRows: rows.length,
        executionTime
      };
    } catch (error) {
      console.error('BigQuery execution error:', error);
      throw new Error(`BigQuery query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // Simple test query to validate connection
      const testQuery = `
        SELECT 
          'connection_test' as test_type,
          CURRENT_DATETIME() as timestamp,
          @@project_id as project_id
      `;
      
      await this.executeQuery(testQuery);
      return true;
    } catch (error) {
      console.error('BigQuery connection test failed:', error);
      return false;
    }
  }

  async getDatasetInfo(): Promise<{
    datasetId: string;
    projectId: string;
    tables: Array<{
      tableId: string;
      type: string;
      numRows: number;
      schema: Array<{
        name: string;
        type: string;
        mode: string;
        description?: string;
      }>;
    }>;
  }> {
    try {
      const dataset = this.client.dataset(this.config.datasetId);
      const [tables] = await dataset.getTables();
      
      const tableInfoPromises = tables.map(async (table) => {
        const [metadata] = await table.getMetadata();
        return {
          tableId: table.id!,
          type: metadata.type || 'TABLE',
          numRows: parseInt(metadata.numRows || '0'),
          schema: metadata.schema?.fields?.map((field: any) => ({
            name: field.name,
            type: field.type,
            mode: field.mode || 'NULLABLE',
            description: field.description
          })) || []
        };
      });

      const tableInfo = await Promise.all(tableInfoPromises);

      return {
        datasetId: this.config.datasetId,
        projectId: this.config.projectId,
        tables: tableInfo
      };
    } catch (error) {
      console.error('Error getting dataset info:', error);
      throw new Error(`Failed to get dataset information: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private optimizeQueryForLargeTables(query: string): string {
    // List of known large tables that need optimization
    const largeTables = ['events', 'order_items', 'users'];
    
    let optimizedQuery = query;
    
    // Check if query involves large tables
    const queryUpper = query.toUpperCase();
    const hasLargeTable = largeTables.some(table => 
      queryUpper.includes(table.toUpperCase())
    );
    
    if (hasLargeTable) {
      // Temporarily disable TABLESAMPLE due to syntax issues
      // Will add it back once we fix the parsing logic
      
      // Add stricter date filtering for events table
      if (queryUpper.includes('EVENTS') && !queryUpper.includes('WHERE')) {
        optimizedQuery = optimizedQuery.replace(
          /FROM\s+[^)]*events[^)]*(?=\s+(GROUP|ORDER|LIMIT|$))/gi,
          (match) => `${match} WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)`
        );
      } else if (queryUpper.includes('EVENTS') && queryUpper.includes('INTERVAL 30 DAY')) {
        // Reduce from 30 days to 7 days for events table
        optimizedQuery = optimizedQuery.replace(/INTERVAL 30 DAY/gi, 'INTERVAL 7 DAY');
      }
      
      // Ensure LIMIT is reasonable
      if (!queryUpper.includes('LIMIT')) {
        optimizedQuery += ' LIMIT 1000';
      } else {
        // Replace large LIMIT values
        optimizedQuery = optimizedQuery.replace(/LIMIT\s+(\d+)/gi, (match, num) => {
          const limit = parseInt(num);
          return limit > 1000 ? 'LIMIT 1000' : match;
        });
      }
    }
    
    return optimizedQuery;
  }

  private sanitizeQuery(query: string): string {
    // Basic query sanitization to prevent malicious queries
    let cleanQuery = query.trim();
    
    // Remove SQL comments
    cleanQuery = cleanQuery.replace(/--.*$/gm, '');
    cleanQuery = cleanQuery.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Normalize whitespace
    cleanQuery = cleanQuery.replace(/\s+/g, ' ').trim();
    
    // If query has multiple statements, take only the first SELECT
    if (cleanQuery.includes(';')) {
      const statements = cleanQuery.split(';').map(s => s.trim()).filter(s => s.length > 0);
      const selectStatement = statements.find(s => s.toUpperCase().startsWith('SELECT'));
      if (selectStatement) {
        cleanQuery = selectStatement;
      }
    }
    
    // Prevent dangerous operations
    const dangerousPatterns = [
      /\b(DROP|DELETE|TRUNCATE|ALTER|CREATE|INSERT|UPDATE)\s+/gi,
      /;\s*DROP\s+/gi,
      /INFORMATION_SCHEMA\./gi
    ];

    dangerousPatterns.forEach(pattern => {
      if (pattern.test(cleanQuery)) {
        throw new Error('Query contains potentially dangerous operations');
      }
    });

    // Ensure query starts with SELECT
    if (!cleanQuery.toUpperCase().startsWith('SELECT')) {
      throw new Error(`Only SELECT queries are allowed. Received query starts with: "${cleanQuery.substring(0, 50)}..."`);
    }

    return cleanQuery;
  }

  async generateRetailSchema(): Promise<string> {
    // Generate a comprehensive retail schema description for the AI agent
    try {
      const datasetInfo = await this.getDatasetInfo();
      
      let schemaDescription = `BigQuery Dataset: ${datasetInfo.projectId}.${datasetInfo.datasetId}\n\n`;
      schemaDescription += `AVAILABLE TABLES AND SCHEMAS:\n\n`;

      datasetInfo.tables.forEach(table => {
        schemaDescription += `TABLE: ${table.tableId} (${table.numRows.toLocaleString()} rows)\n`;
        schemaDescription += `Fields:\n`;
        
        table.schema.forEach(field => {
          schemaDescription += `  - ${field.name}: ${field.type} (${field.mode})`;
          if (field.description) {
            schemaDescription += ` - ${field.description}`;
          }
          schemaDescription += `\n`;
        });
        schemaDescription += `\n`;
      });

      return schemaDescription;
    } catch (error) {
      // Fallback retail schema if dataset inspection fails
      return `
RETAIL DATABASE SCHEMA:

TABLE: sales
  - sale_id: STRING (REQUIRED) - Unique identifier for each sale
  - product_id: STRING (REQUIRED) - Product identifier
  - customer_id: STRING (NULLABLE) - Customer identifier
  - store_id: STRING (REQUIRED) - Store identifier
  - sale_date: DATE (REQUIRED) - Date of sale
  - sale_timestamp: TIMESTAMP (REQUIRED) - Exact time of sale
  - quantity: INTEGER (REQUIRED) - Quantity sold
  - unit_price: FLOAT (REQUIRED) - Price per unit
  - total_amount: FLOAT (REQUIRED) - Total sale amount
  - discount_amount: FLOAT (NULLABLE) - Discount applied
  - payment_method: STRING (REQUIRED) - Payment method used
  - sales_person_id: STRING (NULLABLE) - Salesperson identifier

TABLE: products
  - product_id: STRING (REQUIRED) - Unique product identifier
  - product_name: STRING (REQUIRED) - Product name
  - category: STRING (REQUIRED) - Product category
  - subcategory: STRING (NULLABLE) - Product subcategory
  - brand: STRING (REQUIRED) - Brand name
  - cost_price: FLOAT (REQUIRED) - Cost to acquire product
  - retail_price: FLOAT (REQUIRED) - Selling price
  - stock_level: INTEGER (REQUIRED) - Current inventory level
  - reorder_point: INTEGER (REQUIRED) - Minimum stock before reorder
  - supplier_id: STRING (REQUIRED) - Supplier identifier
  - launch_date: DATE (NULLABLE) - Product launch date
  - discontinued: BOOLEAN (REQUIRED) - Whether product is discontinued

TABLE: customers
  - customer_id: STRING (REQUIRED) - Unique customer identifier
  - first_name: STRING (REQUIRED) - Customer first name
  - last_name: STRING (REQUIRED) - Customer last name
  - email: STRING (NULLABLE) - Customer email
  - phone: STRING (NULLABLE) - Customer phone number
  - date_of_birth: DATE (NULLABLE) - Customer date of birth
  - registration_date: DATE (REQUIRED) - When customer registered
  - loyalty_tier: STRING (REQUIRED) - Customer loyalty level
  - total_lifetime_value: FLOAT (REQUIRED) - Total customer value
  - preferred_store_id: STRING (NULLABLE) - Customer's preferred store

TABLE: stores
  - store_id: STRING (REQUIRED) - Unique store identifier
  - store_name: STRING (REQUIRED) - Store name
  - address: STRING (REQUIRED) - Store address
  - city: STRING (REQUIRED) - Store city
  - state: STRING (REQUIRED) - Store state
  - zip_code: STRING (REQUIRED) - Store ZIP code
  - manager_id: STRING (REQUIRED) - Store manager identifier
  - opening_date: DATE (REQUIRED) - Store opening date
  - store_type: STRING (REQUIRED) - Type of store (flagship, outlet, etc.)
  - square_footage: INTEGER (NULLABLE) - Store size in square feet
`;
    }
  }
}

// Factory function to create BigQuery service from environment
export function createBigQueryService(): BigQueryService | null {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID;
  const datasetId = process.env.BIGQUERY_DATASET_ID || process.env.NEXT_PUBLIC_BIGQUERY_DATASET_ID;
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!projectId || !datasetId) {
    console.warn('BigQuery configuration missing. Please set GOOGLE_CLOUD_PROJECT_ID and BIGQUERY_DATASET_ID environment variables.');
    return null;
  }

  const config: BigQueryConfig = {
    projectId,
    datasetId
  };

  // Configure authentication
  if (serviceAccountKey) {
    try {
      config.credentials = JSON.parse(serviceAccountKey);
    } catch (error) {
      console.error('Invalid service account key format');
      return null;
    }
  } else if (keyFilename) {
    config.keyFilename = keyFilename;
  }

  return new BigQueryService(config);
}