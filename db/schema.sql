-- AI Interview Coach - Azure SQL Database Schema
-- Idempotent T-SQL: safe to run multiple times.

IF OBJECT_ID('dbo.users','U') IS NULL
CREATE TABLE dbo.users (
  id            UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_users PRIMARY KEY DEFAULT NEWID(),
  name          NVARCHAR(100)  NOT NULL,
  email         NVARCHAR(255)  NOT NULL,           -- stored lowercase
  password_hash NVARCHAR(255)  NOT NULL,           -- bcrypt
  created_at    DATETIME2(0)   NOT NULL CONSTRAINT DF_users_created DEFAULT SYSUTCDATETIME(),
  CONSTRAINT UQ_users_email UNIQUE (email)
);

IF OBJECT_ID('dbo.resumes','U') IS NULL
CREATE TABLE dbo.resumes (
  id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_resumes PRIMARY KEY DEFAULT NEWID(),
  user_id         UNIQUEIDENTIFIER NOT NULL CONSTRAINT FK_resumes_user REFERENCES dbo.users(id),
  file_name       NVARCHAR(255)  NOT NULL,
  blob_path       NVARCHAR(500)  NOT NULL,          -- "<userId>/<resumeId>.pdf" inside container
  file_size_bytes INT            NOT NULL,
  analysis        NVARCHAR(MAX)  NULL CONSTRAINT CK_resumes_analysis CHECK (analysis IS NULL OR ISJSON(analysis)=1),
  created_at      DATETIME2(0)   NOT NULL CONSTRAINT DF_resumes_created DEFAULT SYSUTCDATETIME()
);
-- Note: container is private; URLs are never exposed. Access is handled server-side via blob_path.

IF OBJECT_ID('dbo.interviews','U') IS NULL
CREATE TABLE dbo.interviews (
  id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_interviews PRIMARY KEY DEFAULT NEWID(),
  user_id         UNIQUEIDENTIFIER NOT NULL CONSTRAINT FK_interviews_user REFERENCES dbo.users(id),
  resume_id       UNIQUEIDENTIFIER NULL     CONSTRAINT FK_interviews_resume REFERENCES dbo.resumes(id),
  job_role        NVARCHAR(100)  NOT NULL,
  interview_type  NVARCHAR(20)   NOT NULL CONSTRAINT CK_interviews_type CHECK (interview_type IN ('Technical','HR','Mixed','Resume-Based')),
  difficulty      NVARCHAR(20)   NOT NULL CONSTRAINT CK_interviews_diff CHECK (difficulty IN ('Beginner','Intermediate','Advanced')),
  total_questions TINYINT        NOT NULL CONSTRAINT CK_interviews_total CHECK (total_questions BETWEEN 1 AND 15),
  status          NVARCHAR(20)   NOT NULL CONSTRAINT DF_interviews_status DEFAULT 'in_progress' CONSTRAINT CK_interviews_status CHECK (status IN ('in_progress','completed')),
  overall_score   TINYINT        NULL CONSTRAINT CK_interviews_score CHECK (overall_score BETWEEN 0 AND 100),
  report          NVARCHAR(MAX)  NULL CONSTRAINT CK_interviews_report CHECK (report IS NULL OR ISJSON(report)=1),
  created_at      DATETIME2(0)   NOT NULL CONSTRAINT DF_interviews_created DEFAULT SYSUTCDATETIME(),
  completed_at    DATETIME2(0)   NULL
);

IF OBJECT_ID('dbo.questions','U') IS NULL
CREATE TABLE dbo.questions (
  id                 UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_questions PRIMARY KEY DEFAULT NEWID(),
  interview_id       UNIQUEIDENTIFIER NOT NULL CONSTRAINT FK_questions_interview REFERENCES dbo.interviews(id) ON DELETE CASCADE,
  question_text      NVARCHAR(1000) NOT NULL,
  topic              NVARCHAR(100)  NOT NULL,
  category           NVARCHAR(20)   NOT NULL CONSTRAINT CK_questions_cat CHECK (category IN ('Technical','HR','Resume')),
  question_order     INT            NOT NULL,
  is_follow_up       BIT            NOT NULL CONSTRAINT DF_questions_fu DEFAULT 0,
  parent_question_id UNIQUEIDENTIFIER NULL,          -- reserved for optional follow-up feature
  CONSTRAINT UQ_questions_order UNIQUE (interview_id, question_order)
);

IF OBJECT_ID('dbo.answers','U') IS NULL
CREATE TABLE dbo.answers (
  id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_answers PRIMARY KEY DEFAULT NEWID(),
  question_id     UNIQUEIDENTIFIER NOT NULL CONSTRAINT FK_answers_question REFERENCES dbo.questions(id) ON DELETE CASCADE,
  answer_text     NVARCHAR(MAX)  NOT NULL,
  score           TINYINT        NOT NULL CONSTRAINT CK_answers_score CHECK (score BETWEEN 0 AND 10),
  correctness     TINYINT        NOT NULL CONSTRAINT CK_answers_corr  CHECK (correctness BETWEEN 0 AND 10),
  technical_depth TINYINT        NOT NULL CONSTRAINT CK_answers_depth CHECK (technical_depth BETWEEN 0 AND 10),
  clarity         TINYINT        NOT NULL CONSTRAINT CK_answers_clar  CHECK (clarity BETWEEN 0 AND 10),
  relevance       TINYINT        NOT NULL CONSTRAINT CK_answers_rel   CHECK (relevance BETWEEN 0 AND 10),
  feedback        NVARCHAR(MAX)  NOT NULL CONSTRAINT CK_answers_fb CHECK (ISJSON(feedback)=1),   -- {did_well, missing, improve}
  created_at      DATETIME2(0)   NOT NULL CONSTRAINT DF_answers_created DEFAULT SYSUTCDATETIME(),
  CONSTRAINT UQ_answers_question UNIQUE (question_id)      -- one answer per question
);

-- Indexes for performance & quick dashboard/history queries
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_interviews_user_created' AND object_id = OBJECT_ID('dbo.interviews'))
CREATE NONCLUSTERED INDEX IX_interviews_user_created ON dbo.interviews(user_id, created_at DESC) 
INCLUDE (status, overall_score, interview_type, job_role, difficulty);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_resumes_user_created' AND object_id = OBJECT_ID('dbo.resumes'))
CREATE NONCLUSTERED INDEX IX_resumes_user_created ON dbo.resumes(user_id, created_at DESC);
