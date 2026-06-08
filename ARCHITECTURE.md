# WhatsAppHub Frontend Architecture

## Project Structure Overview

This is a modern Next.js 16+ application built with a scalable, modular architecture. The project follows domain-driven design principles with clear separation of concerns.

### Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (grouped layout)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── layout.tsx            # Shared auth layout
│   │   └── page-shell.tsx        # Optional wrapper component
│   │
│   ├── (app)/                    # Protected app routes (grouped layout)
│   │   ├── dashboard/page.tsx
│   │   ├── clients/page.tsx
│   │   ├── onboarding/page.tsx
│   │   ├── webhook/page.tsx
│   │   ├── audit-logs/page.tsx
│   │   ├── users/page.tsx
│   │   ├── roles/page.tsx
│   │   ├── settings/page.tsx
│   │   └── layout.tsx            # Shared app layout
│   │
│   ├── api/                      # API routes
│   │   ├── webhooks/
│   │   │   └── route.ts
│   │   └── health/
│   │       └── route.ts
│   │
│   ├── layout.tsx                # Root layout (global)
│   └── not-found.tsx
│
├── components/                   # React components
│   ├── ui/                       # Reusable UI primitives
│   │   ├── index.ts              # Re-export all UI components
│   │   ├── button/
│   │   ├── input/
│   │   ├── card/
│   │   └── modal/
│   │
│   ├── layouts/                  # Layout components
│   │   ├── index.ts
│   │   ├── app-shell.tsx
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── footer.tsx
│   │
│   ├── common/                   # Shared small components
│   │   ├── index.ts
│   │   ├── breadcrumb.tsx
│   │   ├── status-badge.tsx
│   │   └── empty-state.tsx
│   │
│   └── auth/                     # Auth-specific components
│       ├── SignInForm.tsx
│       ├── SignUpForm.tsx
│       ├── ForgotPasswordForm.tsx
│       └── AuthGuard.tsx
│
├── modules/                      # Domain-driven modules
│   ├── auth/                     # Authentication module
│   │   ├── client/               # Client-side auth logic
│   │   │   └── hooks.ts          # useLogin, useLogout, etc.
│   │   ├── server/               # Server-side auth helpers
│   │   │   └── helpers.ts        # verifyToken, createSession, etc.
│   │   ├── types.ts              # Auth types (User, LoginRequest, etc.)
│   │   └── validators.ts         # Auth form validators (Zod schemas)
│   │
│   ├── client/                   # Client (WhatsApp number) module
│   │   └── types.ts
│   │
│   ├── onboarding/               # Onboarding module
│   │   └── types.ts
│   │
│   ├── webhook/                  # Webhook module
│   │   └── types.ts
│   │
│   ├── audit/                    # Audit logging module
│   │   └── types.ts
│   │
│   ├── user/                     # User management module
│   │   └── types.ts
│   │
│   └── role/                     # Role & permission module
│       └── types.ts
│
├── lib/                          # Utility functions and helpers
│   ├── env.ts                    # Environment validation (Zod)
│   │
│   ├── http/                     # HTTP client
│   │   └── index.ts              # apiFetch, ApiError
│   │
│   ├── auth/                     # Auth utilities
│   │   └── index.ts              # Token storage, session helpers
│   │
│   ├── permissions/              # RBAC utilities
│   │   └── index.ts              # hasPermission, ROLE_PERMISSIONS
│   │
│   └── constants/                # App constants
│       └── index.ts              # Routes, API endpoints, etc.
│
├── store/                        # Zustand stores (UI-only global state)
│   ├── ui.store.ts               # UI state (sidebar, modals, etc.)
│   ├── filters.store.ts          # Filter/search state
│   └── auth-ui.store.ts          # Auth UI state (loading, errors)
│
├── query/                        # TanStack Query (React Query)
│   ├── query-client.ts           # QueryClient configuration
│   ├── provider.tsx              # QueryClientProvider wrapper
│   └── keys.ts                   # Query key factory
│
└── proxy.ts                      # Next.js proxy config (redirects, headers)
```

## Key Architecture Principles

### 1. **Modular Structure** (`modules/`)
- Each domain is self-contained with its own `types.ts` file
- Easy to locate and modify domain-specific logic
- Scales well as the app grows

### 2. **Separation of Concerns**
- **Pages** (`app/`): Routing and page-level components only
- **Components**: UI and layout components
- **Modules**: Business logic, types, and validators
- **Lib**: Reusable utilities and helpers
- **Store**: UI-only global state (Zustand)
- **Query**: Server state management (TanStack Query)

### 3. **Auth Patterns**
- `modules/auth/client/hooks.ts`: Client-side auth hooks (use in components)
- `modules/auth/server/helpers.ts`: Server-side auth helpers (use in API routes)
- `modules/auth/types.ts`: TypeScript interfaces for auth
- `modules/auth/validators.ts`: Zod schemas for form validation

### 4. **State Management**
- **Zustand stores**: For UI state (sidebar toggle, modals, filters)
- **TanStack Query**: For server state (API data caching)
- **React Context** (optional): For cross-cutting concerns like auth session

### 5. **API Communication**
- All API calls go through `lib/http/apiFetch` wrapper
- Consistent error handling with `ApiError` class
- Query keys managed in `query/keys.ts`

## Getting Started

### Setup Environment
```bash
cp .env.example .env.local
```

Required environment variables:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=WhatsAppHub
```

### Install Dependencies
```bash
npm install
# or
yarn install
```

### Run Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Common Tasks

### Adding a New Page
1. Create folder in `app/(app)/new-page/`
2. Create `page.tsx` with metadata
3. Create corresponding layout component in `components/`

### Adding a New Module
1. Create folder in `modules/new-module/`
2. Create `types.ts` for TypeScript interfaces
3. Create `validators.ts` for Zod schemas (if needed)
4. Create sub-folders for `client/` and `server/` helpers (if needed)

### Adding a New API Route
1. Create file in `app/api/route-name/route.ts`
2. Export handler functions: `GET`, `POST`, `PUT`, `DELETE`

### Creating a Query Hook
1. Use query key from `query/keys.ts`
2. Use `apiFetch` from `lib/http` for the request
3. Create custom hook in module's `client/` folder

### Adding Global State
- Use Zustand stores in `store/` for UI state
- Use TanStack Query for server state
- Avoid Redux/Context unless absolutely necessary

## Dependencies

### Core
- **Next.js 16+**: React framework
- **React 19+**: UI library
- **TypeScript**: Type safety

### State Management
- **Zustand**: Lightweight global state
- **@tanstack/react-query**: Server state management

### Utilities
- **Zod**: Schema validation
- **TailwindCSS**: Styling (recommended)

### Optional
- **next-auth**: Authentication (if using Auth.js)
- **axios**: HTTP client (alternative to fetch)

## Best Practices

1. **Keep modules focused**: One domain per module
2. **Use types extensively**: Take advantage of TypeScript
3. **Validate at boundaries**: Use Zod in validators
4. **Query keys**: Always use the key factory, never hardcode
5. **Error handling**: Use `ApiError` class for consistent errors
6. **Component organization**: Keep components close to where they're used
7. **Avoid circular imports**: Use index files for exports
8. **Server vs Client**: Mark components with `"use client"` only when needed

## File Naming Conventions

- Pages: `page.tsx`
- Layouts: `layout.tsx`
- Components: `ComponentName.tsx` (PascalCase)
- Utilities: `utility-name.ts` (kebab-case)
- Stores: `feature.store.ts`
- Hooks: `useFeature.ts`

## Testing Structure (Recommended)

```
src/
├── __tests__/
│   ├── modules/
│   ├── components/
│   ├── lib/
│   └── hooks/
```

## Deployment

The project is configured to deploy on **Vercel**:

```bash
git push origin main
# Vercel automatically deploys on push
```

For other platforms, build the app:
```bash
npm run build
npm start
```

## Support & Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zod Docs](https://zod.dev)
