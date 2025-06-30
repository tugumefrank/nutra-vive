# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

<!-- Test commit to verify Vercel auto-deployment -->

## Project Overview

Nutra-Vive is a Next.js 15 e-commerce application for premium organic juices and herbal teas. It uses TypeScript, React 19, and follows the App Router pattern with server components.

## **CRITICAL TYPE SAFETY REQUIREMENT**

**ALL CODE MUST BE FULLY TYPED AND TYPE-SAFE. NO EXCEPTIONS.**

- Every variable, function parameter, return type, and component prop MUST have explicit TypeScript types
- Use `any` only as an absolute last resort and document why it's necessary
- All server actions must have proper input/output typing
- Components must have properly typed props interfaces
- Event handlers must be properly typed
- State variables must have explicit type annotations
- API responses must be properly typed

## **🚀 Local Error Detection Setup**

**MANDATORY: Run these commands before committing any code to prevent Vercel build failures:**

```bash
# Basic TypeScript check (fast)
npm run type-check

# Strict mode check (same as Vercel uses)
npm run type-check:strict

# Complete check: Lint + TypeScript strict
npm run check-all

# Automatic pre-build check (runs before build)
npm run prebuild
```

**The build process now automatically runs TypeScript strict checking before building. If there are ANY TypeScript errors, the build will fail locally (same as Vercel).**

### **How to Avoid Future Vercel Build Failures:**

1. **ALWAYS run `npm run check-all` before committing**
2. **Fix ALL TypeScript errors shown by the strict checker**
3. **Never commit code with TypeScript errors**
4. **Use the type-check scripts to catch errors early**

### **Enhanced TypeScript Configuration:**
- Strict mode enabled globally
- `exactOptionalPropertyTypes` for precise optional property handling
- `noImplicitReturns` to ensure all code paths return values
- `noFallthroughCasesInSwitch` for safe switch statements
- `noUncheckedIndexedAccess` for array/object access safety

## Development Commands

```bash
# Development
npm run dev           # Start development server with Turbopack
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint

# Database (Drizzle ORM)
npm run db:generate   # Generate database migrations
npm run db:migrate    # Run database migrations
npm run db:push       # Push schema changes directly to database
npm run db:studio     # Open Drizzle Studio for database management
```

## Architecture

### Database & ORM
- **PostgreSQL** with **Drizzle ORM** (not Mongoose despite the connection file)
- Schema defined in `lib/db/schema.ts` with comprehensive e-commerce tables
- Database connection handling in `lib/db/index.ts` with MongoDB fallback (legacy)
- Server actions pattern in `lib/actions/` for database operations

### Authentication & Authorization
- **Clerk** for authentication and user management
- User roles: `user` and `admin`
- Middleware in `middleware.ts` handles auth routing
- Admin routes protected under `/admin` directory

### State Management
- **Zustand** stores in `store/` directory:
  - `cartStore.ts` - Shopping cart state
  - `favoritesStore.ts` - User favorites/wishlist
  - `unifiedCartStore.ts` - Combined cart functionality
  - `membershipCartStore.tsx` - Membership-specific cart
  - Other utility stores (theme, search, UI, user)
- React Context providers in `components/providers/`

### Payment Processing
- **Stripe** integration for payments
- Stripe webhook handling in `api/webhook/`
- Payment intents and checkout in `api/stripe/`

### Email System
- **Resend** for transactional emails
- React Email templates in `lib/email/templates/`
- Email utilities in `lib/email/`

### File Uploads
- **UploadThing** for file/image uploads
- Configuration in `api/uploadthing/`

### Application Structure
- **App Router** with nested layouts
- Route groups: `(auth)`, `(admin)`, main app
- Server components by default, client components marked with 'use client'
- API routes follow REST conventions in `app/api/`

### Key Features
- Multi-store cart system (regular + membership products)
- Product reviews and ratings
- Order tracking system
- Admin dashboard with analytics
- Consultation booking system
- Membership/subscription functionality
- Favorites/wishlist
- Promotional codes and discounts

### Styling
- **Tailwind CSS** with custom configuration
- **shadcn/ui** components in `components/ui/`
- **Framer Motion** for animations
- **Radix UI** primitives for complex components

### Data Flow
1. UI components trigger server actions
2. Server actions interact with database via Drizzle
3. Results flow back to client components
4. Zustand stores manage client-side state
5. React Query (`@tanstack/react-query`) handles server state

## Important Patterns

### Server Actions
- Located in `lib/actions/` organized by domain
- Handle database operations and business logic
- Return serializable data only

### Component Organization
- Domain-specific components in feature directories
- Reusable UI components in `components/ui/`
- Admin components in `components/admin/`
- Layout components in `components/layout/`

### Type Safety
- Comprehensive TypeScript usage
- Database types generated from Drizzle schema
- Zod schemas for validation in `lib/db/schema.ts`
- Custom type definitions in `types/` directory

### Environment Requirements
- `MONGODB_URI` - Database connection (despite using PostgreSQL in schema)
- Clerk authentication keys
- Stripe API keys
- Resend email API key
- UploadThing configuration

When working on this codebase, always consider the dual cart system (regular + membership), maintain type safety, and follow the established server action patterns for data mutations.