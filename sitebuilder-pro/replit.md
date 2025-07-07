# SiteBuilder Pro

## Overview

SiteBuilder Pro is a comprehensive delivery site builder platform that enables users to create professional food delivery websites with integrated WhatsApp ordering, administrative dashboards, and real-time analytics. The application is designed for Brazilian food businesses including açaí shops, burger joints, pizzerias, and sweet shops.

## System Architecture

The application follows a full-stack architecture with clear separation between frontend and backend:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture  
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: Express sessions with PostgreSQL store
- **Development**: TypeScript with ESM modules

## Key Components

### Authentication System
- **Provider**: Replit OIDC authentication
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Strategy**: Passport.js with OpenID Connect strategy
- **Security**: HTTP-only cookies, CSRF protection, secure session handling

### Database Layer
- **ORM**: Drizzle ORM with type-safe queries
- **Database**: PostgreSQL (configured for Neon serverless)
- **Migration**: Drizzle-kit for schema migrations
- **Connection**: Connection pooling with @neondatabase/serverless

### Core Entities
- **Users**: User profiles with Replit integration
- **Sites**: Multi-tenant site management with custom domains/slugs
- **Templates**: Pre-built templates for different business types
- **Products**: Product catalog with images and pricing
- **Orders**: Order management with status tracking
- **Analytics**: Site performance and sales metrics

### UI Components
- **Design System**: shadcn/ui components with Radix UI primitives
- **Theme**: Custom color palette optimized for food businesses
- **Responsive**: Mobile-first design with Tailwind CSS
- **Icons**: Lucide React for consistent iconography

## Data Flow

1. **User Authentication**: Users authenticate via Replit OIDC
2. **Site Creation**: Users select templates and configure site details
3. **Content Management**: Users manage products, orders, and site settings
4. **Public Sites**: Generated sites are accessible via custom slugs
5. **Order Processing**: Orders are captured and managed through the dashboard
6. **Analytics**: Real-time tracking of site performance and sales

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection and querying
- **drizzle-orm**: Type-safe database queries and migrations
- **express**: Web server framework
- **passport**: Authentication middleware
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React router

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **recharts**: Data visualization for analytics

### Development Dependencies
- **typescript**: Type safety across the stack
- **vite**: Fast build tool and development server
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development
- **Server**: Express server with Vite middleware for HMR
- **Database**: PostgreSQL with automatic migrations
- **Environment**: Replit-optimized with cartographer plugin

### Production
- **Build Process**: Vite builds client, esbuild bundles server
- **Server**: Node.js server serving static files and API
- **Database**: Production PostgreSQL with connection pooling
- **Sessions**: Persistent session storage in PostgreSQL

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit application identifier
- `ISSUER_URL`: OIDC issuer URL (defaults to Replit)

## Changelog

Changelog:
- July 07, 2025. Initial setup
- July 07, 2025. Completed full SaaS platform with:
  * Complete site builder with templates (açaí, burger, pizza, doces)
  * Individual analytics per store with charts and metrics
  * PIX integration with automatic QR code generation
  * WhatsApp order integration
  * Public sites with shopping cart functionality
  * Dark/light theme toggle
  * Netlify deployment simulation
  * Production-ready database with PostgreSQL
  * Individual site preview and management

## User Preferences

Preferred communication style: Simple, everyday language.