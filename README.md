# Super Admin Panel - Strategic Grant Compliance CRM

A comprehensive CRM system built with Astro, React, and Tailwind CSS, designed specifically for strategic grant compliance consulting and client management.

## 🚀 Features

### ✅ Currently Implemented
- **Client Management**: Full CRUD operations for client data
- **AI-Powered Chat**: OpenAI integration for client context-aware conversations
- **Document Upload**: Drag-and-drop file upload with client association
- **Database Integration**: Prisma ORM with SQLite/PostgreSQL support
- **Admin Dashboard**: SmartAdmin template integration
- **Multi-Service Integration**: Supabase, Linear, Intercom connections

### 🔧 In Development
- **RAG Document Processing**: AI-powered document analysis and search
- **Grant Compliance Tracking**: Specialized compliance issue management
- **Advanced Analytics**: Business intelligence and reporting
- **Campaign Management**: Automated outreach workflows
- **Team Collaboration**: Multi-user permissions and workflows

### 📋 Planned Features
- **Prospect Scoring**: AI-driven lead prioritization
- **Calendar Integration**: Meeting scheduling and management
- **VoIP Integration**: Call tracking and recording
- **Mobile App**: Native mobile client management
- **Advanced Reporting**: Custom dashboards and analytics

## 🛠 Tech Stack

- **Frontend**: Astro v5 + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + SmartAdmin v5.2.0
- **Database**: Prisma ORM + SQLite (dev) / PostgreSQL (prod)
- **AI/ML**: OpenAI GPT + Vector Search
- **Integrations**: Supabase, Linear, Intercom, Shopify
- **File Upload**: React Dropzone + UUID
- **Authentication**: JWT + Role-based permissions

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd super-admin-panel
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   pnpm approve-builds
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

4. **Initialize database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

## 🔧 Configuration

### Environment Variables

```env
# Supabase Configuration
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Linear Configuration
LINEAR_API_KEY=your_linear_api_key

# Database Configuration
DATABASE_URL="file:./prisma/dev.db"
```

### Database Schema

The application uses Prisma with the following main models:
- **Client**: Core client information and relationships
- **Contact**: Client contacts and communication details
- **Deal**: Sales opportunities and pipeline management
- **Document**: File uploads and document management
- **ChatSession**: AI chat conversations with context
- **ChatMessage**: Individual messages in chat sessions

## 🎯 Usage

### Client Management
1. Navigate to `/crm` to access the CRM dashboard
2. Create new clients using the "New Client" button
3. Upload documents via drag-and-drop interface
4. Use AI chat for client-specific conversations

### API Endpoints
- `GET/POST /api/crm/clients` - Client CRUD operations
- `GET/PUT/DELETE /api/crm/clients/[id]` - Individual client management
- `POST /api/crm/documents/upload` - File upload handling
- `POST /api/crm/chat/sessions` - Chat session management
- `POST /api/crm/chat/ai-response` - AI-powered responses

## 📊 Project Structure

```
src/
├── components/          # React components
│   ├── CRMDashboard.tsx # Main CRM interface
│   └── ...
├── layouts/            # Astro layouts
│   └── AdminLayout.astro
├── lib/               # Utilities and services
│   ├── integrations/  # External service integrations
│   │   ├── crm.ts    # CRM service layer
│   │   ├── openai.ts # AI integration
│   │   └── supabase.ts
│   └── utils/         # Helper functions
├── pages/             # Astro pages and API routes
│   ├── api/          # API endpoints
│   │   └── crm/      # CRM-specific APIs
│   ├── crm.astro     # CRM dashboard page
│   └── index.astro   # Home page
└── generated/         # Prisma generated files
    └── prisma/       # Type definitions
```

## 🔄 Development Workflow

### Linear Integration
This project uses Linear for project management and issue tracking:
- Issues are automatically synced with development progress
- Feature branches are linked to Linear issues
- Commits reference Linear issue IDs

### Code Quality
- TypeScript for type safety
- Prisma for database type safety
- ESLint and Prettier for code formatting
- Automated testing with Jest/Vitest

## 🚀 Deployment

### Production Build
```bash
pnpm build
pnpm preview
```

### Environment Setup
- Configure production database (PostgreSQL recommended)
- Set up proper environment variables
- Configure file upload storage (AWS S3/Supabase Storage)
- Set up monitoring and logging

## 📈 Roadmap

### Phase 1: Core CRM (Current)
- [x] Client management
- [x] Document upload
- [x] AI chat integration
- [x] Basic dashboard

### Phase 2: Advanced Features
- [ ] RAG document processing
- [ ] Grant compliance tracking
- [ ] Advanced search and filtering
- [ ] Campaign management

### Phase 3: Enterprise Features
- [ ] Multi-tenant architecture
- [ ] Advanced analytics
- [ ] Mobile application
- [ ] Third-party integrations

### Phase 4: AI Enhancement
- [ ] Predictive analytics
- [ ] Automated lead scoring
- [ ] Natural language processing
- [ ] Knowledge graph visualization

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `pnpm install`            | Installs dependencies                            |
| `pnpm dev`                | Starts local dev server at `localhost:4321`     |
| `pnpm build`              | Build your production site to `./dist/`         |
| `pnpm preview`            | Preview your build locally, before deploying    |
| `npx prisma generate`     | Generate Prisma client                          |
| `npx prisma migrate dev`  | Run database migrations                         |
| `npx prisma studio`       | Open Prisma Studio for database management     |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch linked to Linear issue
3. Make your changes with proper commit messages
4. Submit a pull request with Linear issue reference

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 🔗 Links

- [Linear Project](https://linear.app) - Project management
- [Supabase Dashboard](https://siaptqymqlotessldqga.supabase.co) - Database management
- [SmartAdmin Documentation](https://smartadmin.lodev09.com/) - UI template

## 📞 Support

For support and questions, please create an issue in Linear or contact the development team.

---

**Built with ❤️ for strategic grant compliance consulting**
