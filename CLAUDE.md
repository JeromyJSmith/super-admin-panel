# CLAUDE.md

This file provides guidance to Claude when working with code in this repository.

## Project Overview

Super Admin Panel is a comprehensive CRM system specifically designed for strategic grant compliance consulting. Built with modern web technologies including Astro v5, React 19, TypeScript, and Prisma ORM. The application features AI-powered client chat, document management with drag-and-drop uploads, and comprehensive client relationship management.

**Current Status**: Phase 1 Complete - All foundation features implemented and working
**Next Phase**: Advanced CRM features including visual deal pipeline, email integration, and enhanced client profiles

## Development Commands

### Setup and Running
```bash
# Install dependencies
pnpm install
pnpm approve-builds

# Database setup
npx prisma generate
npx prisma migrate dev --name init
npx prisma studio  # Visual database management

# Development
pnpm dev  # Start dev server at localhost:4321
```

### Building and Testing
```bash
pnpm build     # Production build to ./dist/
pnpm preview   # Preview production build
```

## Architecture Overview

### Key Design Patterns

1. **Service Layer Pattern**: The application uses a service layer (`src/lib/integrations/`) to encapsulate business logic and external integrations. CRMService handles all database operations through Prisma.

2. **API Route Structure**: All API endpoints follow RESTful conventions under `/api/crm/`, with nested resources for related entities (e.g., `/api/crm/clients/[id]`, `/api/crm/chat/sessions`).

3. **Type Safety**: Full TypeScript integration with Prisma-generated types ensuring type safety from database to frontend. Generated types are located in `src/generated/prisma/`.

### Technology Stack Integration

- **Astro SSR**: Server-side rendering with React islands for interactive components
- **Prisma ORM**: Database abstraction with type-safe queries and migrations
- **Tailwind CSS v4**: Utility-first styling with SmartAdmin template integration
- **AI Integration**: OpenAI API for context-aware chat functionality

### Data Flow

1. **Client Requests** → Astro Pages/API Routes
2. **API Routes** → Service Layer (CRMService, OpenAIService, etc.)
3. **Service Layer** → Prisma ORM → SQLite/PostgreSQL
4. **Response** → React Components → Client

### Key Integrations

- **Supabase**: File storage and authentication (configured via environment variables)
- **Linear**: Project management integration for issue tracking
- **OpenAI**: AI-powered chat with client context awareness
- **Intercom**: Customer communication platform integration

## Environment Configuration

Required environment variables:
- `DATABASE_URL`: Prisma database connection
- `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`: Supabase configuration
- `OPENAI_API_KEY`: OpenAI API access
- `LINEAR_API_KEY`: Linear integration

## Database Schema

The application uses these core models:
- **Client**: Primary entity with relations to all other models
- **Document**: File uploads with client association
- **ChatSession/ChatMessage**: AI conversation history
- **Deal**: Sales pipeline management
- **Contact**: Client contact management

All models include proper cascading deletes and timestamp tracking.

## Current Implementation Status (Phase 1 Complete)

### Fully Working Features
- **Client Management**: Complete CRUD operations with search, filtering, and status management
- **Document Upload**: Drag-and-drop file upload with React Dropzone, client association, and metadata storage
- **AI Chat System**: OpenAI integration with client context, real-time chat interface, and message persistence
- **Dashboard Interface**: Responsive design with tab navigation, metrics overview, and interactive components
- **API Infrastructure**: RESTful endpoints for all operations with proper error handling

### Key Files and Components
- `src/components/CRMDashboard.tsx`: Main dashboard component with all functionality
- `src/pages/api/crm/`: All API endpoints for client management, document upload, and chat
- `prisma/schema.prisma`: Complete database schema with all relationships
- `src/lib/integrations/`: Service layer for external API integrations

### Linear Project Management
- **Current Epic**: EXE-22 - Phase 2: Advanced CRM Features
- **Next Priority**: EXE-24 - Visual Deal Pipeline (13 story points)
- **GitHub Integration**: Repository synced with Linear issues for development tracking

## Development Guidelines

### When Adding New Features
1. Follow the existing service layer pattern in `src/lib/integrations/`
2. Create API routes under `/api/crm/` following RESTful conventions
3. Update Prisma schema and run migrations for database changes
4. Use TypeScript throughout with proper type definitions
5. Reference Linear issues in commit messages (e.g., "EXE-24: Add pipeline feature")

### Code Standards
- Use TypeScript for all new code
- Follow the existing component structure in CRMDashboard.tsx
- Implement proper error handling and loading states
- Use Tailwind CSS classes for styling consistency
- Maintain the existing tab-based navigation pattern

### Testing and Deployment
- Test all features through the CRM dashboard at `/crm`
- Ensure database operations work correctly with Prisma
- Verify API endpoints return proper JSON responses
- Check responsive design across different screen sizes
