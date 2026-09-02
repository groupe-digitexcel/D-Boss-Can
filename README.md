# DBM Candidate Pilot — Trust-Ready v3

Standalone candidate acquisition, pre-screening and verification portal for the first D-Boss-Motos candidates. It is intentionally isolated from the operational DBM system.

## Candidate journey
1. Public landing page and application.
2. Server-side preliminary score.
3. Candidate immediately receives a private verification URL.
4. Candidate uploads ID, driving licence, residence proof and guarantor ID.
5. Candidate submits guarantor and reference details.
6. Admin reviews every document and verification control.
7. Interview and field verification are recorded by the operator.
8. `APPROVED` is server-side blocked until all mandatory controls and required documents are `VERIFIED`.

## Security model
- Supabase service-role key is server-only.
- Candidate document bucket is private.
- Admin access uses Supabase Auth email/password sessions; authorized admins are controlled by `admin_users`.
- No shared `ADMIN_PASSWORD` or `ADMIN_SESSION_SECRET` is required.
- Verification token is high-entropy and is never displayed in the admin candidate list.
- Document type, MIME type and 5 MB size are checked server-side.
- Candidate application endpoint has a basic short-window rate limiter; use Vercel/WAF/rate-limit infrastructure for higher-volume production traffic.
- RLS is enabled on database tables; only server routes use the service role.
- Audit log records application creation, candidate verification submissions and admin/document reviews.

## Important trust rule
`PRE_QUALIFIED` is not approval. The system requires documented human verification. Do not approve a candidate solely because of an automated score or self-declared information.

## Launch requirements
1. Create a **NEW** Supabase project. Never use the operational DBM project.
2. Run `supabase/schema.sql` in the new project's SQL editor.
3. Confirm Storage bucket `candidate-documents` is private.
4. Deploy this repository to Vercel.
5. Set these Vercel environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` (optional)
6. In Supabase Authentication > Users, create each administrator with a unique email/password. Then insert that user UUID into `public.admin_users` with `active=true` (see `supabase/migrations-002-admin-auth.sql`). Do not commit `.env` files.
7. Open `/` and submit one test application.
8. Follow the verification link and upload test documents.
9. Open `/admin`, review documents, set each check to `VERIFIED`, and confirm the server blocks approval until all requirements are satisfied.
10. Delete test records/documents before public advertising.

## Routes
- `/` — public candidate portal
- `/verify/<private-token>` — candidate verification portal
- `/admin` — private operator dashboard

## Admin setup
1. Create an admin user in Supabase Authentication > Users.
2. Copy the user UUID.
3. Add a row to `public.admin_users` with that UUID and email.
4. Repeat for each reviewer/manager; each person has their own credentials.
5. Admin login is at `/admin`.

## Production hardening recommended before high-volume launch
- Add persistent rate limiting (Upstash/Redis or Vercel WAF).
- Add OTP/WhatsApp phone verification.
- Add explicit privacy policy/retention/deletion workflow appropriate to Cameroon law.
- Add malware scanning/content validation for uploaded documents.
- Add automated backups and an incident-response procedure.
- Configure a custom domain and HTTPS in Vercel.


### Upgrading an existing Pilot v1/v2/v3 database
If you already ran the older pilot schema, **do not delete candidate data**. Run `supabase/migrations-002-admin-auth.sql` in the same NEW pilot Supabase project. This adds only the administrator authorization table; it does not connect the pilot to the operational DBM database.
