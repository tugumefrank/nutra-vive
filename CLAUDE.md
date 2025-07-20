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

## **🔗 Next.js 15 API Route Parameters (CRITICAL)**

**In Next.js 15 with App Router, dynamic route parameters MUST be awaited:**

```typescript
// ❌ WRONG - Will cause TypeScript build errors
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const productId = params.id; // Type error!
}

// ✅ CORRECT - Always await params in Next.js 15
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const productId = params.id; // Works correctly!
}
```

**Examples for different dynamic routes:**

```typescript
// Single parameter [id]
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
}

// Multiple parameters [category]/[id]
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ category: string; id: string }> }
) {
  const { category, id } = await context.params;
}

// Optional parameters [[...slug]]
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug?: string[] }> }
) {
  const { slug } = await context.params;
}
```

**This applies to ALL HTTP methods (GET, POST, PUT, DELETE, PATCH) in dynamic API routes.**

## Development Commands

```bash
# Development
npm run dev           # Start development server with Turbopack
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint

# Database Scripts
npm run seed:tea-products       # Seed tea bag products to database
npm run migrate:tea-descriptions # Update tea product descriptions
```

## Architecture

### Database & ORM
- **MongoDB** with **Mongoose** for data persistence
- Models defined in `lib/db/models.ts` and `lib/db/models/` directory
- Database connection handling in `lib/db/index.ts`
- Server actions pattern in `lib/actions/` for database operations

### Authentication & Authorization
- **Clerk** for authentication and user management
- User roles: `user` and `admin`
- Middleware in `middleware.ts` handles auth routing
- Admin routes protected under `/admin` directory

#### **Mobile API Authentication Pattern**
Mobile API endpoints (`/api/mobile/`) use **JWT token validation** instead of web session auth:

- **Mobile endpoints**: Extract JWT from `Authorization: Bearer <token>` header
- **Web app**: Uses `auth()` from `@clerk/nextjs/server` for session-based auth
- **Shared server actions**: Modified to accept optional `userId` parameter for dual compatibility

```typescript
// Mobile API pattern
const token = request.headers.get('Authorization')?.replace('Bearer ', '');
const { userId } = await verifyToken(token); // Clerk JWT validation
await serverAction(data, userId); // Pass userId to server action

// Server action pattern for dual compatibility
async function serverAction(data: DataType, providedUserId?: string) {
  const userId = providedUserId || (await auth()).userId;
  if (!userId) return { error: "Not authenticated" };
  // ... rest of server action logic
}
```

**Important**: When adding new server actions that mobile endpoints will use, always implement the dual auth pattern with optional `userId` parameter to support both mobile JWT and web session authentication.

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
2. Server actions interact with database via Mongoose
3. Results flow back to client components
4. Zustand stores manage client-side state
5. React Query (`@tanstack/react-query`) handles server state

## Important Patterns

### Server Actions
- Located in `lib/actions/` organized by domain
- Handle database operations and business logic
- Return serializable data only

#### **Order Cleanup System**
Automated cleanup system for removing stale pending orders:

- **Cleanup Function**: `orderCleanupServerActions.ts` - Removes orders with `paymentStatus: "pending"` older than 24 hours
- **Admin API**: `/api/admin/cleanup/pending-orders` - Manual cleanup with authentication
- **Cron Job**: `/api/cron/cleanup-pending-orders` - Automated cleanup every 6 hours
- **Vercel Cron**: Configured in `vercel.json` with schedule `"0 */6 * * *"`

**Environment Variables Required:**
- `CLEANUP_API_KEY` - API key for admin cleanup endpoint
- `CRON_SECRET` - Secret for Vercel cron authentication

**Usage:**
```bash
# Manual cleanup (requires admin auth or API key)
curl -X POST https://your-domain.com/api/admin/cleanup/pending-orders \
  -H "x-api-key: your-cleanup-api-key"

# Check pending orders count
curl https://your-domain.com/api/admin/cleanup/pending-orders \
  -H "x-api-key: your-cleanup-api-key"
```

### Component Organization
- Domain-specific components in feature directories
- Reusable UI components in `components/ui/`
- Admin components in `components/admin/`
- Layout components in `components/layout/`

### Type Safety
- Comprehensive TypeScript usage
- Database types defined with Mongoose schemas
- Zod schemas for validation where needed
- Custom type definitions in `types/` directory

### Environment Requirements
- `MONGODB_URI` - MongoDB database connection string
- Clerk authentication keys
- Stripe API keys
- Resend email API key
- UploadThing configuration

## Database Scripts & Utilities

### Tea Products Management
- `npm run seed:tea-products` - Seeds tea bag products with comprehensive descriptions
- `npm run migrate:tea-descriptions` - Updates existing tea product descriptions
- Scripts located in `scripts/` directory use manual environment loading

### Database Patterns
- Manual environment variable loading in scripts (reads from `.env` file)
- Mongoose models with explicit schemas
- Server actions for CRUD operations
- Connection handling with retry logic and URI cleanup

When working on this codebase, always consider the dual cart system (regular + membership), maintain type safety, and follow the established server action patterns for data mutations using Mongoose.