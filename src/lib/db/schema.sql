-- =========================================================================
-- JobPilot AI — Production PostgreSQL & Supabase Database Schema
-- Includes Row Level Security (RLS), Strict Integrity Constraints & Indexes
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Candidate Profiles & Master Resume
CREATE TABLE IF NOT EXISTS master_resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    raw_text TEXT NOT NULL,
    checksum VARCHAR(64) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    location VARCHAR(255),
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    summary TEXT,
    is_immutable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Structured Experience with Explicit Classification
CREATE TABLE IF NOT EXISTS candidate_experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES master_resumes(id) ON DELETE CASCADE,
    employer VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CO_OP', 'RESEARCH_ASSISTANT', 'CONTRACT', 'FREELANCE', 'ACADEMIC_PROJECT')),
    compensation_type VARCHAR(50) DEFAULT 'UNKNOWN',
    start_date VARCHAR(10) NOT NULL,
    end_date VARCHAR(10),
    is_current BOOLEAN DEFAULT FALSE,
    duration_months INT NOT NULL DEFAULT 0,
    location VARCHAR(255),
    work_arrangement VARCHAR(50),
    responsibilities JSONB DEFAULT '[]'::jsonb,
    skills_demonstrated JSONB DEFAULT '[]'::jsonb,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Structured Educations
CREATE TABLE IF NOT EXISTS candidate_educations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES master_resumes(id) ON DELETE CASCADE,
    institution VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    field_of_study VARCHAR(255) NOT NULL,
    start_date VARCHAR(10),
    end_date VARCHAR(10),
    gpa VARCHAR(50),
    honors JSONB DEFAULT '[]'::jsonb,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Candidate Skills Inventory
CREATE TABLE IF NOT EXISTS candidate_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES master_resumes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    years_experience NUMERIC(4, 1),
    proficiency VARCHAR(50),
    source_references JSONB DEFAULT '[]'::jsonb,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Candidate Projects
CREATE TABLE IF NOT EXISTS candidate_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID NOT NULL REFERENCES master_resumes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    description TEXT NOT NULL,
    technologies JSONB DEFAULT '[]'::jsonb,
    url TEXT,
    highlights JSONB DEFAULT '[]'::jsonb,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Normalized Job Postings
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    work_arrangement VARCHAR(50) DEFAULT 'HYBRID',
    employment_type VARCHAR(50) DEFAULT 'FULL_TIME',
    description TEXT NOT NULL,
    required_skills JSONB DEFAULT '[]'::jsonb,
    preferred_skills JSONB DEFAULT '[]'::jsonb,
    min_experience_months INT DEFAULT 0,
    salary_min NUMERIC(12, 2),
    salary_max NUMERIC(12, 2),
    salary_currency VARCHAR(10) DEFAULT 'USD',
    source VARCHAR(50) NOT NULL,
    source_url TEXT NOT NULL,
    application_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    posted_at TIMESTAMP WITH TIME ZONE,
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_external_job_source UNIQUE (source, external_id)
);

-- 7. Applications Tracking
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'DISCOVERED',
    applied_at TIMESTAMP WITH TIME ZONE,
    submission_method VARCHAR(50),
    submission_evidence TEXT,
    notes TEXT DEFAULT '',
    follow_up_date DATE,
    recruiter_name VARCHAR(255),
    recruiter_email VARCHAR(255),
    recruiter_role VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_job_application UNIQUE (user_id, job_id)
);

-- 8. Tailored Resumes with Strict Claim Provenance
CREATE TABLE IF NOT EXISTS tailored_resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    master_resume_id UUID NOT NULL REFERENCES master_resumes(id) ON DELETE CASCADE,
    target_job_title VARCHAR(255) NOT NULL,
    target_company VARCHAR(255) NOT NULL,
    summary TEXT,
    provenance_map JSONB NOT NULL DEFAULT '[]'::jsonb,
    tailored_experiences JSONB NOT NULL DEFAULT '[]'::jsonb,
    tailored_projects JSONB NOT NULL DEFAULT '[]'::jsonb,
    highlighted_skills JSONB DEFAULT '[]'::jsonb,
    reported_skill_gaps JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Cover Letters
CREATE TABLE IF NOT EXISTS cover_letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    recipient_name VARCHAR(255),
    recipient_title VARCHAR(255),
    company_name VARCHAR(255) NOT NULL,
    grounded_facts JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Application Activities (Audit Log)
CREATE TABLE IF NOT EXISTS application_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Email Responses & Integrations
CREATE TABLE IF NOT EXISTS processed_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    message_id VARCHAR(255) NOT NULL UNIQUE,
    thread_id VARCHAR(255) NOT NULL,
    sender VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    date_received TIMESTAMP WITH TIME ZONE NOT NULL,
    snippet TEXT NOT NULL,
    classification VARCHAR(50) NOT NULL,
    confidence NUMERIC(3, 2) NOT NULL,
    matched_company VARCHAR(255),
    matched_job_title VARCHAR(255),
    associated_application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    evidence JSONB DEFAULT '[]'::jsonb,
    is_user_verified BOOLEAN DEFAULT FALSE,
    action_taken TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Scheduled Searches Configuration & History
CREATE TABLE IF NOT EXISTS scheduled_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    is_enabled BOOLEAN DEFAULT TRUE,
    frequency VARCHAR(50) DEFAULT 'DAILY',
    time_of_day VARCHAR(10) DEFAULT '09:00',
    time_zone VARCHAR(100) DEFAULT 'UTC',
    target_titles JSONB DEFAULT '[]'::jsonb,
    keywords JSONB DEFAULT '[]'::jsonb,
    locations JSONB DEFAULT '[]'::jsonb,
    min_match_score INT DEFAULT 70,
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scheduled_search_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_id UUID NOT NULL REFERENCES scheduled_searches(id) ON DELETE CASCADE,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    jobs_discovered INT DEFAULT 0,
    new_jobs_stored INT DEFAULT 0,
    high_match_jobs_found INT DEFAULT 0,
    status VARCHAR(50) NOT NULL,
    sources_checked JSONB DEFAULT '[]'::jsonb,
    errors JSONB DEFAULT '[]'::jsonb,
    duration_ms INT DEFAULT 0
);

-- 13. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_jobs_company_title ON jobs (company, title);
CREATE INDEX IF NOT EXISTS idx_applications_user_status ON applications (user_id, status);
CREATE INDEX IF NOT EXISTS idx_activities_app_id ON application_activities (application_id);
CREATE INDEX IF NOT EXISTS idx_processed_emails_user ON processed_emails (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications (user_id, is_read);

-- Row Level Security (RLS) Policies
ALTER TABLE master_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tailored_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own master resumes" ON master_resumes
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only view their own applications" ON applications
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only view their own processed emails" ON processed_emails
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only view their own notifications" ON notifications
    FOR ALL USING (auth.uid() = user_id);
