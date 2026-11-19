# Supabase migration package

Converted from the supplied MariaDB/phpMyAdmin dump.

## Included
- `supabase/migrations/20261119000000_initial_schema.sql`
  - Creates all 40 tables.
  - Converts MySQL data types to PostgreSQL-compatible types.
  - Creates 40 primary keys, 74 indexes (including unique indexes), and 26 foreign keys.
  - Enables Row Level Security (RLS) on every table.
  - Does not include the original INSERT statements or private user/session data.

## Apply the schema
1. Open your Supabase project.
2. Open **SQL Editor**.
3. Open `20261119000000_initial_schema.sql` from this package.
4. Paste its contents into a new SQL query and run it.
5. If it fails, stop and share the exact first error. Do not repeatedly run a partially applied script.

## Important data migration note
This is a schema migration, not a complete data migration. Your original dump contains application records and sensitive material such as password hashes, OTPs, session payloads, and reset tokens. Do not commit the original dump or customer data to a public GitHub repository.

For data migration, restore the original dump into a temporary MariaDB/MySQL instance and migrate the required application tables into Supabase PostgreSQL using a migration tool such as pgloader or a controlled ETL process. Migrate only the tables and records the application still needs. Do not migrate stale sessions, OTPs, password-reset tokens, cache, or queue records.

## Authentication warning
The legacy `public.users` table is not the same as Supabase `auth.users`. This migration keeps the old table and its bigint foreign keys intact for compatibility. Do not expose `public.users`, password hashes, `sessions`, `email_otps`, or `password_reset_tokens` through the client API. If you move authentication to Supabase Auth, plan a separate account migration and map the legacy bigint user IDs to `auth.users.id` UUIDs.

## RLS warning
RLS is enabled on all 40 tables, and no permissive policies are added. This is intentionally fail-closed. Browser/mobile clients will not be able to read or write rows until you create policies for the exact customer/vendor/admin workflows. A trusted server using the Supabase service-role key can perform privileged operations; never put that key in frontend code.

## Supabase Storage vs GitHub
Use GitHub as the source-control location for this migration, application code, and documentation. Use Supabase Storage for actual uploaded media:
- `product-media` (public read): product photos, brand logos, banners and public site images.
- `private-uploads` (private): customer documents, contact-form attachments and private files.

The SQL dump only contains old file paths such as `uploads/products/...`; it does not contain the actual image bytes. You must upload the original files from your old application's `uploads/` directory to Supabase Storage and update the corresponding database path fields to Storage object paths (or URLs). A GitHub repository is not a suitable customer-upload storage service.

## After importing rows with explicit IDs
PostgreSQL identity sequences do not automatically advance when explicit IDs are inserted. For each identity column, reset its sequence to the current maximum ID before creating new records. Example for one table:

```sql
SELECT setval(
  pg_get_serial_sequence('public.products', 'id'),
  COALESCE((SELECT MAX(id) FROM public.products), 1),
  EXISTS (SELECT 1 FROM public.products)
);
```

Repeat for each identity-backed table that received explicit IDs.

## Review before production
- Review RLS policies and Data API grants.
- Move authentication to Supabase Auth only as a separate planned migration.
- Confirm all file paths have corresponding Storage objects.
- Test inserts, updates, deletes, checkout, order creation, vendor workflows and admin operations.
- Keep the original SQL dump and a database backup in a secure private location.
