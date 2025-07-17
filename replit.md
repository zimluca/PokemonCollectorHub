# PokeHunter - Pokemon Card Collection Hub

## Overview

This is a full-stack web application for Pokemon card collectors built with React, Express.js, and PostgreSQL. The application allows users to browse a Pokemon card database, manage their personal collections, and stay updated with the latest Pokemon TCG news. It features a modern UI with shadcn/ui components, multi-language support (English/Italian), and a RESTful API backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: shadcn/ui component library built on Radix UI
- **Styling**: Tailwind CSS with custom Pokemon-themed color palette
- **Internationalization**: React i18next for English/Italian language support
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (migrated from in-memory storage)
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Validation**: Zod schemas for type-safe API validation
- **API Pattern**: RESTful API with JSON responses
- **Error Handling**: Centralized error middleware
- **Data Initialization**: Database seeding with comprehensive Pokemon card data and authentic official card images

### Database Schema
The application uses a PostgreSQL database with the following main entities:
- `users`: User authentication and profiles
- `articles`: News articles with multilingual content
- `collections`: Pokemon card sets/collections
- `productTypes`: Different types of Pokemon products (cards, packs, etc.)
- `products`: Individual Pokemon cards and products
- `userCollections`: User's personal card collections

## Key Components

### Frontend Components
- **Layout**: Header with navigation and language selector, footer with branding
- **Pages**: Home (hero + news), News listing, Database search, Collection management
- **UI Components**: Comprehensive shadcn/ui component library including cards, buttons, forms, modals, etc.
- **Hooks**: Custom hooks for mobile detection and toast notifications

### Backend Components
- **Routes**: RESTful endpoints for articles, collections, products, and user collections
- **Storage**: Abstract storage interface with PostgreSQL implementation via Drizzle ORM
- **Database**: Full PostgreSQL integration with seeded Pokemon card data including all V/ex/VMAX cards with authentic official images
- **Middleware**: Request logging, JSON parsing, error handling
- **Development**: Vite integration for hot module replacement

### Shared Components
- **Schema**: Drizzle ORM schema definitions with Zod validation
- **Types**: TypeScript interfaces for type safety across frontend and backend

## Data Flow

1. **Client Requests**: Frontend makes API calls using TanStack Query
2. **API Processing**: Express routes handle requests, validate with Zod schemas
3. **Data Storage**: Storage layer abstracts database operations via PostgreSQL and Drizzle ORM
4. **Response**: JSON responses sent back to client
5. **State Management**: TanStack Query caches and manages server state
6. **UI Updates**: React components re-render based on query state changes

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Router via Wouter)
- TanStack Query for server state management
- Radix UI primitives for accessible components
- Tailwind CSS for styling
- React i18next for internationalization
- Lucide React for icons

### Backend Dependencies
- Express.js for server framework
- Drizzle ORM for database operations
- Neon Database serverless PostgreSQL
- Zod for schema validation
- ESBuild for production builds

### Development Dependencies
- Vite for development server and builds
- TypeScript for type safety
- ESLint and Prettier for code quality
- Replit-specific plugins for development environment

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx for TypeScript execution with nodemon-like behavior
- **Database**: Neon Database with connection pooling
- **Environment**: Replit-optimized with cartographer plugin

### Production
- **Frontend**: Static build output served by Express
- **Backend**: Compiled to ESM modules with esbuild
- **Database**: PostgreSQL via Neon with environment-based configuration
- **Process**: Single Node.js process serving both frontend and API

### Configuration
- Database connection via `DATABASE_URL` environment variable
- Drizzle migrations in `./migrations` directory
- Build outputs to `./dist` directory
- Static assets served from `./dist/public`

The application is designed to be easily deployable to various platforms while maintaining a clean separation between frontend and backend concerns.