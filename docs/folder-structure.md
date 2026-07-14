# Folder Structure

```text
app/
  (auth)/
    login/
    signup/
    forgot-password/
    reset-password/
  (dashboard)/
    dashboard/
    clubs/
    events/
    analytics/
    notifications/
    approvals/
    admin/
  api/
    auth/
config/
  db.ts
  schema.ts
components/
  auth/
  layout/
  ui/
lib/
  constants/
  repositories/
  services/
  validators/
scripts/
docs/
```

## Notes

- `app/(auth)` contains public authentication flows.
- `app/(dashboard)` contains protected experiences.
- `lib/` holds reusable business logic.
- `config/` holds database wiring and schema definitions.
- `docs/` captures the phase-one architecture contract.
