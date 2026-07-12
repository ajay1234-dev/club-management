# API Surface

## Authentication

- `POST /api/auth/register` creates a Student or Club Admin account.
- `POST /api/auth/forgot-password` creates a reset token and sends email instructions.
- `POST /api/auth/reset-password` validates a token and updates the password.
- `GET|POST /api/auth/[...nextauth]` powers credentials login and JWT sessions.

## Protected App Routes

- `/dashboard` overview dashboard.
- `/dashboard/clubs` club directory.
- `/dashboard/events` future event management surface.
- `/dashboard/analytics` future analytics surface.
- `/dashboard/notifications` future notification surface.
- `/dashboard/approvals` future approval workflow surface.
- `/dashboard/admin` super admin surface.

## Validation Rules

- All mutation endpoints validate input with Zod before invoking services.
- Login requests validate role, email, and password.
- Registration requests enforce role-specific fields.
- Reset requests require a one-time token and password confirmation.
