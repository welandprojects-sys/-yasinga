# replit.md

## Overview

Yasinga is a smart M-Pesa business expense tracking application built for Kenyan businesses and individuals. The application automatically processes SMS transaction notifications to categorize and track financial flows, providing users with real-time insights into their business and personal expenses. The system features intelligent transaction detection, automatic supplier recognition, and comprehensive reporting capabilities designed specifically for M-Pesa payment workflows.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client uses React 18 with TypeScript in a single-page application (SPA) architecture. The UI is built with shadcn/ui components and Radix UI primitives, styled with Tailwind CSS. The application implements client-side routing using Wouter and state management through TanStack Query (React Query) for server state synchronization. The design follows a mobile-first approach with Progressive Web App (PWA) capabilities, featuring bottom navigation and responsive layouts optimized for mobile devices.

### Backend Architecture
The server follows a RESTful Express.js architecture with TypeScript. The application uses a modular structure separating concerns into distinct layers: routes, storage, and database access. Authentication is handled through Replit's OpenID Connect integration with session-based state management. The server implements middleware for request logging, error handling, and authentication verification across protected routes.

### Database Design
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema includes core entities for users, categories, transactions, suppliers, and SMS settings. Session storage is implemented using connect-pg-simple for persistent authentication state. The database design supports multi-tenant architecture where all data is scoped to individual users through foreign key relationships.

### Authentication System
Authentication is implemented using Replit's built-in OpenID Connect (OIDC) provider with Passport.js strategy. The system maintains user sessions in PostgreSQL and implements automatic user creation on first login. Protected routes use middleware to verify authentication status and redirect unauthenticated users to the login flow.

### Data Processing Pipeline
The application processes M-Pesa SMS notifications through intelligent parsing algorithms that extract transaction details, amounts, and counterparty information. Smart supplier recognition automatically identifies recurring merchants and creates supplier profiles. The categorization system supports both manual assignment and automatic categorization based on transaction patterns and user-defined rules.

### Mobile-First Design
The application is designed as a mobile-first web application with PWA capabilities. The interface uses bottom navigation, touch-optimized interactions, and responsive layouts that work across different screen sizes. The design system uses CSS custom properties for theming with support for light and dark modes.

## External Dependencies

### Database Services
- **Neon Database**: PostgreSQL hosting service integrated through the `@neondatabase/serverless` driver with WebSocket support for connection pooling and serverless compatibility.

### UI Framework
- **shadcn/ui**: Complete UI component library built on Radix UI primitives providing accessible, customizable components following modern design patterns.
- **Radix UI**: Headless UI primitives for complex components like dialogs, dropdowns, and form controls with built-in accessibility features.

### Development Tools
- **Vite**: Modern build tool and development server with TypeScript support, hot module replacement, and optimized production builds.
- **Drizzle**: Type-safe ORM with migration support, schema validation, and excellent TypeScript integration for database operations.

### Authentication
- **Replit Auth**: Integrated OpenID Connect authentication provider handling user management, session state, and secure authentication flows without requiring external services.

### State Management
- **TanStack Query**: Powerful data fetching and caching library for managing server state, providing optimistic updates, background synchronization, and cache invalidation strategies.

### Styling
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens and responsive design capabilities, integrated with PostCSS for build-time optimization.