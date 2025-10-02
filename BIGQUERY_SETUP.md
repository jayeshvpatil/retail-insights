# BigQuery Integration Setup Guide

## Overview
This retail insights application now supports real-time BigQuery integration for live data analytics. Follow this guide to connect your own BigQuery dataset.

## Prerequisites
- Google Cloud Project with BigQuery enabled
- BigQuery dataset with retail data
- Service account with appropriate permissions

## Setup Steps

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the BigQuery API

### 2. Create Service Account
1. Go to IAM & Admin > Service Accounts
2. Click "Create Service Account"
3. Provide name and description
4. Grant the following roles:
   - BigQuery Data Viewer
   - BigQuery User
   - BigQuery Job User

### 3. Generate Service Account Key
1. Click on the created service account
2. Go to Keys tab
3. Click "Add Key" > "Create new key"
4. Choose JSON format
5. Download the key file

### 4. Configure Environment Variables
Add the following to your `.env.local` file:

```bash
# Gemini AI Configuration
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyDz5I2p0EIVUL7-9aZVIMC2IXH4qw-YxyU

# BigQuery Configuration
NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID=helpful-helper-516
NEXT_PUBLIC_BIGQUERY_DATASET_ID=dce-gcp-training.thelook_ecommerce

# Authentication (choose one):
# Option 1: Service Account Key JSON (recommended for production)
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}

# Option 2: Path to service account key file
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json

# Option 3: Use gcloud CLI (for local development)
# Run: gcloud auth application-default login
```

### 5. Prepare Your Dataset
The application works best with retail data following this schema:

#### Required Tables:
- **sales**: Transaction data with products, customers, dates, amounts
- **products**: Product catalog with categories, prices, inventory
- **customers**: Customer information and demographics
- **stores**: Store locations and information

#### Example Schema:
```sql
-- Sales table
CREATE TABLE `your-project.your-dataset.sales` (
  sale_id STRING,
  product_id STRING,
  customer_id STRING,
  store_id STRING,
  sale_date DATE,
  quantity INTEGER,
  unit_price FLOAT64,
  total_amount FLOAT64,
  category STRING,
  payment_method STRING
);

-- Products table
CREATE TABLE `your-project.your-dataset.products` (
  product_id STRING,
  product_name STRING,
  category STRING,
  brand STRING,
  cost_price FLOAT64,
  retail_price FLOAT64,
  stock_level INTEGER,
  supplier_id STRING
);

-- Customers table
CREATE TABLE `your-project.your-dataset.customers` (
  customer_id STRING,
  first_name STRING,
  last_name STRING,
  email STRING,
  registration_date DATE,
  loyalty_tier STRING,
  total_lifetime_value FLOAT64
);
```

## Sample Data
If you don't have retail data, you can use our sample data generator:

```sql
-- Generate sample sales data
INSERT INTO `your-project.your-dataset.sales` 
SELECT 
  GENERATE_UUID() as sale_id,
  CONCAT('PROD_', CAST(MOD(ABS(FARM_FINGERPRINT(GENERATE_UUID())), 1000) AS STRING)) as product_id,
  CONCAT('CUST_', CAST(MOD(ABS(FARM_FINGERPRINT(GENERATE_UUID())), 5000) AS STRING)) as customer_id,
  CONCAT('STORE_', CAST(MOD(ABS(FARM_FINGERPRINT(GENERATE_UUID())), 50) AS STRING)) as store_id,
  DATE_SUB(CURRENT_DATE(), INTERVAL MOD(ABS(FARM_FINGERPRINT(GENERATE_UUID())), 365) DAY) as sale_date,
  MOD(ABS(FARM_FINGERPRINT(GENERATE_UUID())), 5) + 1 as quantity,
  ROUND(RAND() * 100 + 10, 2) as unit_price,
  ROUND((MOD(ABS(FARM_FINGERPRINT(GENERATE_UUID())), 5) + 1) * (RAND() * 100 + 10), 2) as total_amount,
  CASE MOD(ABS(FARM_FINGERPRINT(GENERATE_UUID())), 4)
    WHEN 0 THEN 'Bags'
    WHEN 1 THEN 'Shoes'
    WHEN 2 THEN 'Shirts'
    ELSE 'Accessories'
  END as category,
  CASE MOD(ABS(FARM_FINGERPRINT(GENERATE_UUID())), 3)
    WHEN 0 THEN 'Credit Card'
    WHEN 1 THEN 'Cash'
    ELSE 'Debit Card'
  END as payment_method
FROM UNNEST(GENERATE_ARRAY(1, 10000)) as i;
```

## Testing Connection
1. Start your application: `npm run dev`
2. Go to the Dashboard tab
3. Check the "Data Connection Status" card
4. Click "Test Connection" to verify setup

## Features Available with BigQuery
- ✅ Real-time SQL query execution
- ✅ Live data analytics and insights  
- ✅ Dynamic schema detection
- ✅ Business intelligence recommendations
- ✅ Performance-optimized queries
- ✅ Security and compliance filtering

## Troubleshooting

### Connection Issues
- Verify your project ID and dataset ID are correct
- Check service account has proper permissions
- Ensure BigQuery API is enabled
- Validate JSON key format

### Query Errors  
- Check that your tables match expected schema
- Verify table and column names
- Ensure proper data types are used

### Performance Tips
- Use partitioned tables for large datasets
- Create appropriate indexes
- Monitor query costs in BigQuery console
- Use clustering for frequently queried columns

## Fallback Mode
If BigQuery connection fails, the application automatically falls back to simulated data for demonstration purposes. All features remain functional with realistic mock data.

## Support
For additional help:
1. Check the BigQuery connection status in the dashboard
2. Review browser console for error messages  
3. Verify environment variables are properly set
4. Test connection using the built-in test feature

---

🎉 **Once connected, your retail insights application will provide real-time business intelligence powered by your actual data!**