-- CNIC was already present in the Prisma schema but absent from the deployed table.
-- Keep this nullable in the first rollout: existing users must provide their real
-- CNIC through an approved account update flow; this migration must not invent it.
ALTER TABLE "users" ADD COLUMN "cnic" VARCHAR(13);

-- Persist only normalized CNICs (13 ASCII digits). Input formatting is stripped
-- by the API before storage, and this constraint also protects direct DB writes.
ALTER TABLE "users"
  ADD CONSTRAINT "users_cnic_format_check"
  CHECK ("cnic" IS NULL OR "cnic" ~ '^[0-9]{13}$');

CREATE UNIQUE INDEX "users_cnic_key" ON "users"("cnic");
