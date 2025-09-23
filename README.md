# Retail Insights Agentic Application

A modern retail analytics platform built with Next.js, featuring AI-powered insights through RAG (Retrieval-Augmented Generation) and Text-to-SQL capabilities using Google's Gemini AI models.

## 🌟 Features

- **Modern UI**: Built with Radix UI components and Tailwind CSS
- **AI-Powered Chat**: Interactive chat interface for business questions
- **Dashboard Analytics**: Real-time KPIs for Sales, Customer Engagement, and Inventory
- **Anomaly Detection**: Intelligent alerts for unusual patterns in your data
- **RAG Integration**: Query unstructured documents for insights
- **Text-to-SQL**: Natural language to database queries
- **Business Reports**: Comprehensive reporting system
- **Retail-Focused**: Optimized for fashion retail (bags, shirts, shoes, etc.)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **AI/ML**: Google Gemini AI
- **Charts**: Recharts
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd data-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local .env
   ```
   Edit `.env.local` and add your Gemini API key:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Getting Your Gemini API Key

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env.local` file

## 📱 Application Features

### Dashboard
- **Sales Performance**: Real-time sales metrics with trend analysis
- **Customer Engagement**: Customer interaction and satisfaction metrics  
- **Inventory Management**: Stock levels and turnover rates
- **Visual Analytics**: Interactive charts and graphs

### Chat Interface
- **Natural Language Queries**: Ask questions in plain English
- **RAG Capabilities**: Query unstructured documents
- **Text-to-SQL**: Generate database queries from natural language
- **Context-Aware Responses**: Intelligent responses based on retail context

### Anomaly Detection
- **Real-time Monitoring**: Continuous monitoring of business metrics
- **Smart Alerts**: Automated detection of unusual patterns
- **Impact Assessment**: Understand the potential business impact
- **Investigation Tools**: Drill down into anomalies for root cause analysis

### Reports
- **Pre-built Templates**: Standard retail analytics reports
- **Scheduled Reports**: Automated report generation
- **Export Capabilities**: Download reports in multiple formats
- **Custom Analytics**: Build custom reports for specific needs

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   ├── chat-interface.tsx # Chat functionality
│   ├── dashboard.tsx      # Main dashboard
│   ├── navigation.tsx     # App navigation
│   ├── anomaly-detection.tsx
│   └── reports.tsx
├── lib/                   # Utility functions
│   ├── utils.ts          # General utilities
│   └── retail-agent.ts   # AI agent service
└── styles/               # Global styles
```

## 🤖 AI Integration

The application uses Google's Gemini AI models for:

1. **RAG (Retrieval-Augmented Generation)**
   - Query unstructured retail documents
   - Context-aware responses
   - Document-based insights

2. **Text-to-SQL**
   - Natural language to database queries
   - Automated data analysis
   - Business intelligence automation

3. **General Business Intelligence**
   - Retail-specific insights
   - Trend analysis
   - Predictive analytics

## 🎨 UI Components

Built with Radix UI primitives for:
- Accessibility out of the box
- Consistent design system
- Highly customizable components
- TypeScript support

## 📊 Sample Data

The application includes mock retail data for:
- Sales transactions
- Product inventory
- Customer analytics
- Market trends

Replace with your actual data sources in production.

## 🔧 Customization

### Adding New Features
1. Create new components in `src/components/`
2. Add routes in `src/app/`
3. Extend the AI agent in `src/lib/retail-agent.ts`

### Styling
- Customize theme colors in `tailwind.config.ts`
- Update CSS variables in `src/app/globals.css`
- Add new component styles using Tailwind classes

### Data Integration
- Replace mock data with real database connections
- Implement actual SQL query execution
- Add authentication and authorization

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
```bash
npm i -g vercel
vercel
```

### Deploy to Other Platforms
The application can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify  
- Azure Static Web Apps
- Google Cloud Run

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed description
3. Join our community discussions

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Radix UI](https://www.radix-ui.com/) - Low-level UI primitives
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Google Gemini AI](https://ai.google.dev/) - AI/ML capabilities
- [Lucide](https://lucide.dev/) - Beautiful icons
