# Campus Club Hub

Campus Club Hub is a Phase 1 production foundation for a centralized college club portal. It uses Next.js 15 App Router, TypeScript, Tailwind CSS, Drizzle ORM, Neon PostgreSQL, NextAuth/Auth.js credentials auth, bcrypt password hashing, Resend email delivery, and a future-ready Cloudinary image layer.

## Phase 1 Scope

- App Router foundation with public, auth, and protected route groups.
- Role-based authentication for Student, Club Admin, and Super Admin.
- Secure password reset flow using one-time reset tokens.
- Drizzle schema for clubs, roles, users, student profiles, admin profiles, sessions, and reset tokens.
- Seeded catalog of all 11 clubs.
- Protected dashboard shell with reusable layout primitives.
- Documentation for architecture, API surface, folder structure, and coding standards.

## Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Shadcn-style UI components
- Drizzle ORM
- Neon PostgreSQL
- NextAuth/Auth.js credentials provider
- bcrypt
- Resend
- Framer Motion

## Getting Started & How to Run

Follow these instructions to set up and run the application locally:

### 1. Environment Configuration

Create a `.env.local` file in the root folder of the project by copying the example file:

```bash
cp .env.example .env.local
```

Fill in the environment variables (see the [Environment Variables](#environment-variables) section below for detailed descriptions).

### 2. Installation

Install the project dependencies using `npm`:

```bash
npm install
```

### 3. Database Sync

Push the Drizzle schemas to your Neon PostgreSQL database instance:

```bash
npm run db:push
```

### 4. Database Seeding

Seed the initial list of official roles (`student`, `club_admin`, `super_admin`) and all 11 campus clubs:

```bash
npm run db:seed
```

### 5. Running the Application

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Scripts

- `npm run dev` starts the development server.
- `npm run build` builds the app for production.
- `npm run start` runs the production server.
- `npm run lint` runs ESLint.
- `npm run typecheck` runs the TypeScript compiler.
- `npm run db:generate` generates Drizzle migrations.
- `npm run db:push` pushes the current Drizzle schema.
- `npm run db:studio` opens Drizzle Studio.
- `npm run db:seed` seeds roles and clubs.

## Environment Variables

Define the following keys in your `.env.local` file:

| Variable                | Description                                                              | Example / Default                              |
| ----------------------- | ------------------------------------------------------------------------ | ---------------------------------------------- |
| `DATABASE_URL`          | Neon PostgreSQL database connection string.                              | `postgresql://user:password@localhost:5432/db` |
| `AUTH_SECRET`           | A secure, random 32-character string used by NextAuth to encrypt tokens. | `some-random-32-char-secret-string`            |
| `NEXTAUTH_SECRET`       | Session verification secret compatibility key.                           | `some-random-32-char-secret-string`            |
| `NEXT_PUBLIC_APP_URL`   | The public base URL of the web application.                              | `http://localhost:3000`                        |
| `NEXT_PUBLIC_APP_NAME`  | The brand identity name displayed in headers.                            | `Campus Club Hub`                              |
| `RESEND_API_KEY`        | Resend API credential token for outgoing emails.                         | `re_123456789...`                              |
| `RESEND_FROM_EMAIL`     | Authorized email domain address to send messages.                        | `Campus Club Hub <noreply@yourdomain.com>`     |
| `CLOUDINARY_CLOUD_NAME` | Cloud name identifier from the Cloudinary console.                       | `your_cloud_name`                              |
| `CLOUDINARY_API_KEY`    | Public access key from the Cloudinary console.                           | `your_api_key`                                 |
| `CLOUDINARY_API_SECRET` | Protected private secret from the Cloudinary console.                    | `your_api_secret`                              |

## Architecture Docs

- [Folder Structure](docs/folder-structure.md)
- [Coding Standards](docs/coding-standards.md)
- [API Surface](docs/api.md)
- [Architecture Overview](docs/architecture.md)
- [ER Diagram](docs/er-diagram.mmd)

## Deployment Notes

- Deploy on Vercel.
- Point `DATABASE_URL` at Neon PostgreSQL.
- Set `AUTH_SECRET`, `NEXTAUTH_SECRET`, `RESEND_API_KEY`, and `RESEND_FROM_EMAIL` in production.
- Add Cloudinary credentials later without changing the foundation.
