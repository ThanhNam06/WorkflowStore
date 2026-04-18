export type WorkflowSeed = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  platform: 'make' | 'n8n';
  complexity: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  features: string[];
  image: string;
  userGuide?: string;
};

export const makeWorkflows: WorkflowSeed[] = [
  {
    id: "make-seq-001",
    title: "Daily Report Generator",
    description: "Automatically compile data from multiple sources, format it into a professional report, and email it to stakeholders every morning",
    price: 49,
    category: "sequential",
    platform: "make",
    complexity: "beginner",
    estimatedTime: "30 minutes setup",
    features: [
      "Google Sheets data extraction",
      "PDF report generation",
      "Automated email delivery",
      "Custom branding support"
    ],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    userGuide: "1. Connect your Google account\n2. Select the source spreadsheet\n3. Customize the PDF template\n4. Set the daily schedule"
  },
  {
    id: "make-seq-002",
    title: "File Backup Automation",
    description: "Sequentially backup files from Dropbox to Google Drive and Amazon S3 with compression and encryption",
    price: 39,
    category: "sequential",
    platform: "make",
    complexity: "beginner",
    estimatedTime: "20 minutes setup",
    features: [
      "Multi-cloud backup",
      "File compression",
      "Encryption support",
      "Backup verification logs"
    ],
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
    userGuide: "1. Link your Dropbox and target cloud providers\n2. Specify the folders to backup\n3. Configure encryption keys\n4. Enable notifications for backup status"
  },
  {
    id: "make-cond-001",
    title: "Smart Lead Router",
    description: "Automatically qualify leads based on criteria and route high-value prospects to sales team instantly",
    price: 79,
    category: "conditional",
    platform: "make",
    complexity: "intermediate",
    estimatedTime: "45 minutes setup",
    features: [
      "Multi-criteria lead scoring",
      "Intelligent team assignment",
      "Slack notifications",
      "CRM integration (HubSpot, Salesforce)"
    ],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "make-cond-002",
    title: "Expense Approval Workflow",
    description: "Route expense reports to appropriate managers based on amount and department with automated approval logic",
    price: 69,
    category: "conditional",
    platform: "make",
    complexity: "intermediate",
    estimatedTime: "1 hour setup",
    features: [
      "Amount-based routing",
      "Multi-level approvals",
      "Email notifications",
      "Expense tracking dashboard"
    ],
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "make-loop-001",
    title: "Bulk Email Personalizer",
    description: "Send personalized emails to thousands of contacts with dynamic content replacement and tracking",
    price: 89,
    category: "loop",
    platform: "make",
    complexity: "intermediate",
    estimatedTime: "45 minutes setup",
    features: [
      "CSV contact import",
      "Dynamic content variables",
      "Open rate tracking",
      "Bounce handling"
    ],
    image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "make-loop-002",
    title: "Product Image Optimizer",
    description: "Batch resize, compress and add watermarks to product images for e-commerce platforms",
    price: 59,
    category: "loop",
    platform: "make",
    complexity: "beginner",
    estimatedTime: "30 minutes setup",
    features: [
      "Batch image processing",
      "Multiple size outputs",
      "Watermark addition",
      "Cloud storage integration"
    ],
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "make-event-001",
    title: "Real-Time Form Handler",
    description: "Instantly process form submissions, validate data, send confirmations, and add to CRM",
    price: 69,
    category: "event-driven",
    platform: "make",
    complexity: "beginner",
    estimatedTime: "30 minutes setup",
    features: [
      "Webhook triggers",
      "Data validation",
      "Instant email responses",
      "CRM auto-update"
    ],
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "make-event-002",
    title: "Payment Notification System",
    description: "Trigger instant notifications and invoice generation when payments are received",
    price: 79,
    category: "event-driven",
    platform: "make",
    complexity: "intermediate",
    estimatedTime: "1 hour setup",
    features: [
      "Stripe/PayPal webhooks",
      "Auto invoice generation",
      "Multi-channel notifications",
      "Receipt automation"
    ],
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "make-auto-001",
    title: "Social Media Manager Pro",
    description: "Complete social media automation: schedule posts, monitor mentions, respond to comments across all platforms",
    price: 129,
    category: "automation",
    platform: "make",
    complexity: "advanced",
    estimatedTime: "2 hours setup",
    features: [
      "Multi-platform posting",
      "Content calendar integration",
      "Auto-response system",
      "Analytics dashboard"
    ],
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "make-auto-002",
    title: "Customer Onboarding Suite",
    description: "End-to-end customer onboarding automation with welcome emails, account setup, and training resources",
    price: 149,
    category: "automation",
    platform: "make",
    complexity: "advanced",
    estimatedTime: "3 hours setup",
    features: [
      "Welcome email sequence",
      "Account provisioning",
      "Training material delivery",
      "Progress tracking"
    ],
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "make-ai-001",
    title: "AI Content Generator",
    description: "Generate blog posts, social media content, and marketing copy using GPT-4 with brand voice customization",
    price: 99,
    category: "ai",
    platform: "make",
    complexity: "intermediate",
    estimatedTime: "1 hour setup",
    features: [
      "GPT-4 integration",
      "Brand voice training",
      "Multi-format output",
      "SEO optimization"
    ],
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "make-ai-002",
    title: "Email Sentiment Analyzer",
    description: "Automatically analyze customer emails for sentiment and priority, route urgent issues to management",
    price: 89,
    category: "ai",
    platform: "make",
    complexity: "intermediate",
    estimatedTime: "45 minutes setup",
    features: [
      "Sentiment analysis AI",
      "Priority classification",
      "Auto-tagging",
      "Smart routing"
    ],
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "make-pipe-001",
    title: "Data Warehouse Sync",
    description: "ETL pipeline to extract data from multiple sources, transform it, and load into your data warehouse",
    price: 159,
    category: "pipeline",
    platform: "make",
    complexity: "advanced",
    estimatedTime: "4 hours setup",
    features: [
      "Multi-source extraction",
      "Data transformation rules",
      "Scheduled syncing",
      "Error handling & logging"
    ],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "make-pipe-002",
    title: "CRM Data Consolidator",
    description: "Consolidate customer data from multiple CRMs into a single source of truth with deduplication",
    price: 139,
    category: "pipeline",
    platform: "make",
    complexity: "advanced",
    estimatedTime: "3 hours setup",
    features: [
      "Multi-CRM integration",
      "Duplicate detection",
      "Data normalization",
      "Real-time syncing"
    ],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "make-micro-001",
    title: "API Gateway Orchestrator",
    description: "Modular workflow connecting multiple APIs with authentication, rate limiting, and error handling",
    price: 179,
    category: "microservices",
    platform: "make",
    complexity: "advanced",
    estimatedTime: "5 hours setup",
    features: [
      "Multi-API orchestration",
      "Authentication manager",
      "Rate limiting",
      "Retry logic"
    ],
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "make-micro-002",
    title: "Modular E-commerce Backend",
    description: "Reusable microservices for inventory, orders, payments, and shipping that can be mixed and matched",
    price: 199,
    category: "microservices",
    platform: "make",
    complexity: "advanced",
    estimatedTime: "6 hours setup",
    features: [
      "Modular components",
      "Independent scaling",
      "Service discovery",
      "Event messaging"
    ],
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "make-auto-003",
    title: "Automated Webinar Follow-up",
    description: "Automatically send personalized follow-up sequences, certificates, and recordings to webinar attendees based on their watch time.",
    price: 89,
    category: "conditional",
    platform: "make",
    complexity: "intermediate",
    estimatedTime: "45 minutes setup",
    features: [
      "Zoom Webinar integration",
      "Watch-time based conditional routing",
      "PDF Certificate generation",
      "Multi-step email sequence"
    ],
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    userGuide: "1. Authenticate Zoom and your Email provider.\n2. Set watch-time thresholds in the router module.\n3. Customize the certificate template.\n4. Turn on the workflow."
  },
  {
    id: "make-auto-004",
    title: "Ultimate Notion CRM Sync",
    description: "Bi-directional synchronization between Notion and HubSpot CRM, automatically enriching new contacts with Clearbit data.",
    price: 119,
    category: "automation",
    platform: "make",
    complexity: "advanced",
    estimatedTime: "2 hours setup",
    features: [
      "Bi-directional sync",
      "Clearbit data enrichment",
      "Slack notifications for new deals",
      "Error handling and logging"
    ],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    userGuide: "1. Import the blueprint into Make.\n2. Connect Notion, HubSpot, Clearbit, and Slack.\n3. Map your custom fields.\n4. Run a test and activate."
  }
];

export const n8nWorkflows: WorkflowSeed[] = [
  {
    id: "n8n-seq-001",
    title: "Automated Invoice Generator",
    description: "Sequential workflow to generate, format, and email invoices from your accounting system",
    price: 45,
    category: "sequential",
    platform: "n8n",
    complexity: "beginner",
    estimatedTime: "25 minutes setup",
    features: [
      "QuickBooks integration",
      "PDF invoice creation",
      "Email automation",
      "Payment link insertion"
    ],
    image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "n8n-seq-002",
    title: "Database Backup Pipeline",
    description: "Automated daily database backups with compression, encryption, and multi-location storage",
    price: 59,
    category: "sequential",
    platform: "n8n",
    complexity: "intermediate",
    estimatedTime: "45 minutes setup",
    features: [
      "PostgreSQL/MySQL support",
      "Compression & encryption",
      "Multi-cloud storage",
      "Backup verification"
    ],
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "n8n-cond-001",
    title: "Intelligent Support Ticket Router",
    description: "Route support tickets to the right team based on keywords, priority, and customer tier",
    price: 75,
    category: "conditional",
    platform: "n8n",
    complexity: "intermediate",
    estimatedTime: "1 hour setup",
    features: [
      "Keyword detection",
      "Priority assessment",
      "Team assignment logic",
      "SLA tracking"
    ],
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "n8n-cond-002",
    title: "Content Moderation Bot",
    description: "Automatically approve, reject, or flag content based on customizable rules and AI analysis",
    price: 85,
    category: "conditional",
    platform: "n8n",
    complexity: "advanced",
    estimatedTime: "1.5 hours setup",
    features: [
      "AI content analysis",
      "Custom rule engine",
      "Auto-moderation",
      "Human review queue"
    ],
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "n8n-loop-001",
    title: "Mass Data Updater",
    description: "Update thousands of database records with new information from spreadsheets or APIs",
    price: 79,
    category: "loop",
    platform: "n8n",
    complexity: "intermediate",
    estimatedTime: "45 minutes setup",
    features: [
      "Bulk database updates",
      "CSV/Excel import",
      "Progress tracking",
      "Rollback support"
    ],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "n8n-loop-002",
    title: "Multi-Platform Content Publisher",
    description: "Publish the same content across multiple platforms with platform-specific formatting",
    price: 69,
    category: "loop",
    platform: "n8n",
    complexity: "beginner",
    estimatedTime: "40 minutes setup",
    features: [
      "Multi-platform support",
      "Format adaptation",
      "Scheduling options",
      "Publishing analytics"
    ],
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "n8n-event-001",
    title: "Webhook Alert System",
    description: "Real-time alert system triggered by webhooks for critical events across your stack",
    price: 65,
    category: "event-driven",
    platform: "n8n",
    complexity: "beginner",
    estimatedTime: "30 minutes setup",
    features: [
      "Custom webhook support",
      "Multi-channel alerts",
      "Alert prioritization",
      "On-call routing"
    ],
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "n8n-event-002",
    title: "E-commerce Order Processor",
    description: "Instantly process new orders: inventory update, shipping label, customer notification",
    price: 89,
    category: "event-driven",
    platform: "n8n",
    complexity: "intermediate",
    estimatedTime: "1.5 hours setup",
    features: [
      "Order webhook triggers",
      "Inventory management",
      "Shipping integration",
      "Email notifications"
    ],
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "n8n-auto-001",
    title: "LinkedIn Lead Generator",
    description: "Automate LinkedIn prospecting, connection requests, and personalized follow-up messages",
    price: 119,
    category: "automation",
    platform: "n8n",
    complexity: "advanced",
    estimatedTime: "2 hours setup",
    features: [
      "Profile scraping",
      "Auto-connection requests",
      "Personalized messaging",
      "Response tracking"
    ],
    image: "https://images.unsplash.com/photo-1611944212129-29977ae1398c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "n8n-auto-002",
    title: "HR Onboarding Automation",
    description: "Complete HR onboarding: account creation, access provisioning, documentation, training scheduling",
    price: 139,
    category: "automation",
    platform: "n8n",
    complexity: "advanced",
    estimatedTime: "3 hours setup",
    features: [
      "Multi-system provisioning",
      "Document generation",
      "Training scheduling",
      "Progress dashboard"
    ],
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "n8n-ai-001",
    title: "AI Email Assistant",
    description: "AI-powered email drafting, summarization, and auto-response with context awareness",
    price: 95,
    category: "ai",
    platform: "n8n",
    complexity: "intermediate",
    estimatedTime: "1 hour setup",
    features: [
      "GPT-4 email drafting",
      "Context understanding",
      "Auto-categorization",
      "Smart replies"
    ],
    image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "n8n-ai-002",
    title: "Image Recognition Pipeline",
    description: "Analyze images using AI for object detection, text extraction, and automatic tagging",
    price: 109,
    category: "ai",
    platform: "n8n",
    complexity: "advanced",
    estimatedTime: "2 hours setup",
    features: [
      "Object detection",
      "OCR text extraction",
      "Auto-tagging",
      "Image classification"
    ],
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "n8n-pipe-001",
    title: "Analytics Data Pipeline",
    description: "Extract data from multiple sources, clean it, and load into analytics platforms",
    price: 149,
    category: "pipeline",
    platform: "n8n",
    complexity: "advanced",
    estimatedTime: "4 hours setup",
    features: [
      "Multi-source extraction",
      "Data cleaning rules",
      "BigQuery/Snowflake loading",
      "Scheduled processing"
    ],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "n8n-pipe-002",
    title: "Real-Time Data Sync",
    description: "Keep data synchronized across multiple platforms in real-time with conflict resolution",
    price: 129,
    category: "pipeline",
    platform: "n8n",
    complexity: "advanced",
    estimatedTime: "3 hours setup",
    features: [
      "Bi-directional sync",
      "Conflict resolution",
      "Change detection",
      "Audit logging"
    ],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "n8n-micro-001",
    title: "Serverless Function Hub",
    description: "Collection of reusable serverless functions for common tasks that can be called from anywhere",
    price: 169,
    category: "microservices",
    platform: "n8n",
    complexity: "advanced",
    estimatedTime: "5 hours setup",
    features: [
      "Reusable functions",
      "HTTP endpoints",
      "Authentication",
      "Documentation"
    ],
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "n8n-micro-002",
    title: "Enterprise Integration Hub",
    description: "Modular integration platform connecting all your enterprise systems with standardized interfaces",
    price: 189,
    category: "microservices",
    platform: "n8n",
    complexity: "advanced",
    estimatedTime: "6 hours setup",
    features: [
      "Enterprise connectors",
      "Standard interfaces",
      "Message queuing",
      "Load balancing"
    ],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "n8n-ai-003",
    title: "AI Customer Feedback Analyzer",
    description: "Ingest product reviews automatically, use OpenAI to extract sentiment and feature requests, and push categorized data to Airtable.",
    price: 139,
    category: "ai",
    platform: "n8n",
    complexity: "advanced",
    estimatedTime: "3 hours setup",
    features: [
      "Review scraping (Trustpilot/AppStore)",
      "OpenAI sentiment analysis",
      "Airtable auto-categorization",
      "Weekly email digest"
    ],
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
    userGuide: "1. Paste the workflow JSON into n8n.\n2. Add your OpenAI and Airtable credentials.\n3. Set your scraping targets.\n4. Configure the cron node."
  },
  {
    id: "n8n-event-003",
    title: "Shopify Abandoned Cart Recovery",
    description: "Recover lost sales with a multi-channel approach: email reminders, SMS alerts via Twilio, and Facebook Custom Audience retargeting.",
    price: 99,
    category: "event-driven",
    platform: "n8n",
    complexity: "intermediate",
    estimatedTime: "2 hours setup",
    features: [
      "Shopify webhook trigger",
      "Twilio SMS integration",
      "Facebook Ads API connection",
      "Dynamic discount code generation"
    ],
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80",
    userGuide: "1. Set up Shopify webhooks to point to your n8n instance.\n2. Authenticate Twilio and Facebook.\n3. Adjust the wait nodes for optimal timing.\n4. Activate the workflow."
  }
];

export const allWorkflows: WorkflowSeed[] = [...makeWorkflows, ...n8nWorkflows];
