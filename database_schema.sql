-- Main users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    clerk_id TEXT UNIQUE NOT NULL,
    name TEXT,
    username TEXT,
    email TEXT,
    img_url TEXT,
    designation TEXT DEFAULT 'Not available',
    social_accounts TEXT DEFAULT 'Not available',
    personal_info TEXT DEFAULT 'Not available',
    work_type TEXT DEFAULT 'Not available',
    career_status TEXT DEFAULT 'Not available',
    experience TEXT DEFAULT 'Not available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE usage (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(clerk_id),
    tokens_used INTEGER DEFAULT 0,
    video_minutes_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interviews table
CREATE TABLE interviews (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(clerk_id),
    interview_name TEXT,
    interview_time TIMESTAMP WITH TIME ZONE,
    company TEXT,
    company_logo TEXT,
    position TEXT,
    location TEXT,
    difficulty_level TEXT,
    experience TEXT,
    status TEXT DEFAULT 'ACTIVE',
    duration INTEGER,
    interview_style TEXT,
    job_description TEXT,
    interview_link TEXT,
    expiry_date TIMESTAMP WITH TIME ZONE,
    salary TEXT,
    recruiter_title TEXT,
    employment_type TEXT,
    job_type TEXT,
    type TEXT, -- 'INTERVIEW' or 'JOB'
    interview_type TEXT,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_duration INTEGER DEFAULT 0
);

-- Job listings (extended interviews table but separate type)
CREATE TABLE advertisement_interviews (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(clerk_id),
    interview_name TEXT,
    company TEXT,
    company_logo TEXT,
    position TEXT,
    location TEXT,
    job_description TEXT,
    salary TEXT,
    recruiter_title TEXT,
    employment_type TEXT,
    job_type TEXT,
    type TEXT DEFAULT 'JOB',
    status TEXT DEFAULT 'ACTIVE',
    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interview attempts table
CREATE TABLE interview_attempts (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(clerk_id),
    interview_id BIGINT REFERENCES interviews(id),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'PENDING',
    interview_attempt INTEGER DEFAULT 1,
    chat_conversation JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Reports table
CREATE TABLE ai_reports (
    id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT REFERENCES interview_attempts(id),
    user_id TEXT REFERENCES users(clerk_id),
    report_content TEXT,
    report_type TEXT DEFAULT 'GENERAL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resumes table
CREATE TABLE resumes (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(clerk_id),
    resume_data TEXT,
    resume_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resume HTML storage
CREATE TABLE resume_html (
    id BIGSERIAL PRIMARY KEY,
    clerk_id TEXT NOT NULL,
    resume_html TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company logos storage
CREATE TABLE logos (
    id BIGSERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admission interviews (separate from regular interviews)
CREATE TABLE admission_interviews (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT REFERENCES users(clerk_id),
    interview_name TEXT,
    company TEXT,
    position TEXT,
    location TEXT,
    description TEXT,
    duration INTEGER,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisement_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_html ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_usage_user_id ON usage(user_id);
CREATE INDEX idx_interviews_user_id ON interviews(user_id);
CREATE INDEX idx_interview_attempts_user_id ON interview_attempts(user_id);
CREATE INDEX idx_interview_attempts_interview_id ON interview_attempts(interview_id);
CREATE INDEX idx_ai_reports_user_id ON ai_reports(user_id);
CREATE INDEX idx_ai_reports_attempt_id ON ai_reports(attempt_id);
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resume_html_clerk_id ON resume_html(clerk_id);
