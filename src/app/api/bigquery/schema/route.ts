import { NextRequest, NextResponse } from 'next/server';
import { createBigQueryService } from '../../../../lib/bigquery-service';

export async function GET(request: NextRequest) {
  try {
    const bigQueryService = createBigQueryService();
    
    if (!bigQueryService) {
      return NextResponse.json({
        schema: `
RETAIL DATABASE SCHEMA (Simulated):

TABLE: sales
  - id: INTEGER (PRIMARY KEY) - Unique sale identifier
  - product_id: STRING - Product identifier
  - customer_id: STRING - Customer identifier
  - quantity: INTEGER - Quantity sold
  - unit_price: FLOAT64 - Price per unit
  - total_amount: FLOAT64 - Total sale amount
  - sale_date: DATE - Date of sale
  - category: STRING - Product category
  - store_id: STRING - Store identifier
  - payment_method: STRING - Payment method

TABLE: products
  - id: STRING (PRIMARY KEY) - Product identifier
  - name: STRING - Product name
  - category: STRING - Product category (Bags, Shoes, Shirts, Accessories)
  - brand: STRING - Brand name
  - cost: FLOAT64 - Cost price
  - retail_price: FLOAT64 - Selling price
  - stock_level: INTEGER - Current inventory
  - supplier_id: STRING - Supplier identifier
  - launch_date: DATE - Product launch date

TABLE: customers
  - id: STRING (PRIMARY KEY) - Customer identifier
  - name: STRING - Customer name
  - email: STRING - Customer email
  - age_group: STRING - Age demographic
  - location: STRING - Customer location
  - registration_date: DATE - Registration date
  - loyalty_tier: STRING - Loyalty program tier
  - lifetime_value: FLOAT64 - Total customer value
`
      });
    }

    // Get actual schema from BigQuery
    const schema = await bigQueryService.generateRetailSchema();
    
    return NextResponse.json({
      schema: schema
    });
    
  } catch (error) {
    console.error('Schema endpoint error:', error);
    
    return NextResponse.json({
      schema: `
RETAIL DATABASE SCHEMA (Fallback):

TABLE: sales (Sample data for demonstration)
TABLE: products (Sample data for demonstration)  
TABLE: customers (Sample data for demonstration)
TABLE: stores (Sample data for demonstration)

Note: Unable to retrieve actual schema. Using fallback schema for demo purposes.
`
    });
  }
}