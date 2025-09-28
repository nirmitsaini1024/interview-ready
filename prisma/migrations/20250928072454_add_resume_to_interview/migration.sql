/*
  Warnings:

  - You are about to drop the `Candidate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Interview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Interviewer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Job` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Candidate" DROP CONSTRAINT "Candidate_jobId_fkey";

-- DropForeignKey
ALTER TABLE "Interview" DROP CONSTRAINT "Interview_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_interviewerId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_interviewId_fkey";

-- DropTable
DROP TABLE "Candidate";

-- DropTable
DROP TABLE "Interview";

-- DropTable
DROP TABLE "Interviewer";

-- DropTable
DROP TABLE "Job";

-- DropTable
DROP TABLE "Question";

-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "clerk_id" TEXT NOT NULL,
    "name" TEXT,
    "username" TEXT,
    "email" TEXT,
    "img_url" TEXT,
    "designation" TEXT DEFAULT 'Not available',
    "social_accounts" TEXT DEFAULT 'Not available',
    "personal_info" TEXT DEFAULT 'Not available',
    "work_type" TEXT DEFAULT 'Not available',
    "career_status" TEXT DEFAULT 'Not available',
    "experience" TEXT DEFAULT 'Not available',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "tokens_used" INTEGER NOT NULL DEFAULT 0,
    "video_minutes_used" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interviews" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT,
    "interview_name" TEXT,
    "interview_time" TIMESTAMP(3),
    "company" TEXT,
    "company_logo" TEXT,
    "position" TEXT,
    "location" TEXT,
    "difficulty_level" TEXT,
    "experience" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "duration" INTEGER,
    "interview_style" TEXT,
    "job_description" TEXT,
    "resume" TEXT,
    "questions" JSONB,
    "interview_link" TEXT,
    "expiry_date" TIMESTAMP(3),
    "salary" TEXT,
    "recruiter_title" TEXT,
    "employment_type" TEXT,
    "job_type" TEXT,
    "type" TEXT,
    "interview_type" TEXT,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "current_duration" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertisement_interviews" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT,
    "interview_name" TEXT,
    "company" TEXT,
    "company_logo" TEXT,
    "position" TEXT,
    "location" TEXT,
    "job_description" TEXT,
    "salary" TEXT,
    "recruiter_title" TEXT,
    "employment_type" TEXT,
    "job_type" TEXT,
    "type" TEXT NOT NULL DEFAULT 'JOB',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "advertisement_interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_attempts" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "interview_id" BIGINT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "interview_attempt" INTEGER NOT NULL DEFAULT 1,
    "chat_conversation" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_reports" (
    "id" BIGSERIAL NOT NULL,
    "attempt_id" BIGINT,
    "user_id" TEXT,
    "report_content" TEXT,
    "report_type" TEXT NOT NULL DEFAULT 'GENERAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resumes" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "resume_data" TEXT,
    "resume_type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_html" (
    "id" BIGSERIAL NOT NULL,
    "clerk_id" TEXT NOT NULL,
    "resume_html" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resume_html_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logos" (
    "id" BIGSERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admission_interviews" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT,
    "interview_name" TEXT,
    "company" TEXT,
    "position" TEXT,
    "location" TEXT,
    "description" TEXT,
    "duration" INTEGER,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admission_interviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_id_key" ON "users"("clerk_id");

-- AddForeignKey
ALTER TABLE "usage" ADD CONSTRAINT "usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("clerk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("clerk_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisement_interviews" ADD CONSTRAINT "advertisement_interviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("clerk_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_attempts" ADD CONSTRAINT "interview_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("clerk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_attempts" ADD CONSTRAINT "interview_attempts_interview_id_fkey" FOREIGN KEY ("interview_id") REFERENCES "interviews"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_reports" ADD CONSTRAINT "ai_reports_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "interview_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_reports" ADD CONSTRAINT "ai_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("clerk_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("clerk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_html" ADD CONSTRAINT "resume_html_clerk_id_fkey" FOREIGN KEY ("clerk_id") REFERENCES "users"("clerk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admission_interviews" ADD CONSTRAINT "admission_interviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("clerk_id") ON DELETE SET NULL ON UPDATE CASCADE;
