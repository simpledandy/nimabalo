# Supabase schema onboarding

This folder keeps database-related context in the repository so contributors can bootstrap the same schema consistently.

## Files

- `schema.sql`: current baseline schema snapshot used by the app.

## Recommended workflow

For long-term maintenance, prefer **migration-first** changes:

1. Create a new migration (Supabase CLI)
2. Apply migration to local/dev
3. Commit migration SQL
4. Regenerate database types

## Generating TypeScript types (recommended)

If you use Supabase CLI and project linkage:

```bash
supabase gen types typescript --linked > src/lib/database.types.ts
```

Then use those types in query helpers/hooks for safer refactors.
