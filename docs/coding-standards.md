# Coding Standards

## Type Safety

- Use strict TypeScript types everywhere.
- Prefer Zod schemas for external input.
- Keep shared role and club constants in one place.

## Naming

- Use descriptive file and function names.
- Prefer `repository` for persistence helpers and `service` for business logic.
- Keep route groups and folders aligned with app behavior.

## Error Handling

- Validate before mutation.
- Throw explicit errors from services.
- Keep route handlers thin and return stable JSON error envelopes.
- Log server-side failures with structured metadata.

## UI

- Use reusable shells and card components.
- Keep the paper-and-pencil aesthetic consistent with off-white backgrounds, black outlines, and soft shadows.
- Preserve accessibility and responsive behavior on all screens.

## Database

- Use Drizzle for schema, inserts, and updates.
- Seed static lookup data through a dedicated script.
- Keep future feature tables additive rather than destructive.
