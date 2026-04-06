-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(80) NOT NULL,
    "email" VARCHAR(120) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "bio" TEXT,
    "profile_image" TEXT,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_moderator" BOOLEAN NOT NULL DEFAULT false,
    "is_suspended" BOOLEAN NOT NULL DEFAULT false,
    "avatar_frame" VARCHAR(50) NOT NULL DEFAULT 'basic',
    "showcase_build_id" INTEGER,
    "is_public_profile" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "builds" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "total_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "image_url" TEXT,
    "performance_score" DOUBLE PRECISION,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "builds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parts" (
    "id" SERIAL NOT NULL,
    "build_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "url" TEXT,
    "image_url" TEXT,
    "specifications" JSON,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bug_reports" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "email" VARCHAR(255),
    "description" TEXT NOT NULL,
    "category" VARCHAR(50),
    "image_url" VARCHAR(500),
    "images" JSON,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "priority" VARCHAR(20) NOT NULL DEFAULT 'medium',
    "admin_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bug_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_entitlements" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tier" VARCHAR(50) NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_entitlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_ai_usage" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_ai_usage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "builds_user_id_idx" ON "builds"("user_id");

-- CreateIndex
CREATE INDEX "builds_is_public_is_featured_idx" ON "builds"("is_public", "is_featured");

-- CreateIndex
CREATE INDEX "parts_build_id_idx" ON "parts"("build_id");

-- CreateIndex
CREATE INDEX "parts_category_idx" ON "parts"("category");

-- CreateIndex
CREATE INDEX "bug_reports_status_idx" ON "bug_reports"("status");

-- CreateIndex
CREATE INDEX "bug_reports_user_id_idx" ON "bug_reports"("user_id");

-- CreateIndex
CREATE INDEX "user_entitlements_user_id_idx" ON "user_entitlements"("user_id");

-- CreateIndex
CREATE INDEX "daily_ai_usage_user_id_date_idx" ON "daily_ai_usage"("user_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_ai_usage_user_id_date_key" ON "daily_ai_usage"("user_id", "date");

-- AddForeignKey
ALTER TABLE "builds" ADD CONSTRAINT "builds_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parts" ADD CONSTRAINT "parts_build_id_fkey" FOREIGN KEY ("build_id") REFERENCES "builds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bug_reports" ADD CONSTRAINT "bug_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_entitlements" ADD CONSTRAINT "user_entitlements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_ai_usage" ADD CONSTRAINT "daily_ai_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
