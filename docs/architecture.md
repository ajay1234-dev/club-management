# Architecture Overview

Campus Club Hub uses a modular Next.js App Router structure with clear separation between presentation, application logic, persistence, and infrastructure concerns.

## Layers

- Presentation layer: route-group layouts, pages, and reusable UI components.
- Application layer: auth service, validators, permissions, and logging.
- Data layer: Drizzle schema and repository functions.
- Infrastructure layer: Neon database access, NextAuth handlers, Resend email delivery, middleware, and environment validation.

## Module Boundaries

- Public experience lives under the root page and marketing shell.
- Authentication lives under `app/(auth)` and uses shared form components.
- Protected application pages live under `app/(dashboard)` and inherit RBAC-aware layout protection.
- Database access is centralized in `config/db.ts`.
- Shared business rules live in `lib/`.

## Design Principles

- SOLID-friendly module boundaries.
- Reusable UI shells and components.
- Server actions or route handlers for stateful operations.
- Strict validation before persistence.
- Explicit error handling and structured logging.
- Future feature routes can be added without changing the core auth or data model.
