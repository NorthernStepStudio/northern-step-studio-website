CREATE TABLE IF NOT EXISTS "nstep_testers" (
    "id" SERIAL PRIMARY KEY,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(120) NOT NULL DEFAULT '',
    "app_slug" VARCHAR(120),
    "reason" TEXT NOT NULL DEFAULT '',
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "admin_notes" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "nstep_testers_email_idx" ON "nstep_testers" ("email");
CREATE INDEX IF NOT EXISTS "nstep_testers_status_idx" ON "nstep_testers" ("status");
CREATE INDEX IF NOT EXISTS "nstep_testers_app_slug_idx" ON "nstep_testers" ("app_slug");
CREATE INDEX IF NOT EXISTS "nstep_testers_created_at_idx" ON "nstep_testers" ("created_at" DESC);

CREATE UNIQUE INDEX IF NOT EXISTS "nstep_testers_email_app_slug_key"
    ON "nstep_testers" ("email", COALESCE("app_slug", ''));
