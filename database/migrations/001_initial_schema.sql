-- SQL Migration: 001_initial_schema.sql
-- Description: Initializes the core database tables for Orchestrix (Users, Workflows, Agents, and AnalysisResults)
-- Target Database: PostgreSQL (v12+)

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a common trigger function for updating modified timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------
-- 1. USERS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'analyst' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Trigger for Users updated_at
CREATE TRIGGER update_users_modtime
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();


-- ---------------------------------------------------------
-- 2. WORKFLOWS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_template BOOLEAN DEFAULT FALSE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for Workflows
CREATE INDEX IF NOT EXISTS idx_workflows_created_by ON workflows(created_by);
CREATE INDEX IF NOT EXISTS idx_workflows_name ON workflows(name);
CREATE INDEX IF NOT EXISTS idx_workflows_metadata ON workflows USING gin (metadata);

-- Trigger for Workflows updated_at
CREATE TRIGGER update_workflows_modtime
    BEFORE UPDATE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();


-- ---------------------------------------------------------
-- 3. AGENTS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(100) NOT NULL,
    base_temperature NUMERIC(3,2) DEFAULT 0.20 CHECK (base_temperature >= 0.0 AND base_temperature <= 2.0),
    cognitive_depth VARCHAR(50) DEFAULT 'high' NOT NULL,
    memory_context_size VARCHAR(50) DEFAULT '128k' NOT NULL,
    system_instruction TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for Agents
CREATE INDEX IF NOT EXISTS idx_agents_name ON agents(name);
CREATE INDEX IF NOT EXISTS idx_agents_is_active ON agents(is_active);

-- Trigger for Agents updated_at
CREATE TRIGGER update_agents_modtime
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();


-- ---------------------------------------------------------
-- 4. WORKFLOW AGENTS (M2M Relationship between Workflows & Agents)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS workflow_agents (
    workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    execution_order INT NOT NULL,
    PRIMARY KEY (workflow_id, agent_id),
    CONSTRAINT unique_workflow_agent_order UNIQUE (workflow_id, execution_order)
);

-- Indexes for Workflow Agents (Foreign Keys)
CREATE INDEX IF NOT EXISTS idx_workflow_agents_workflow ON workflow_agents(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_agents_agent ON workflow_agents(agent_id);


-- ---------------------------------------------------------
-- 5. ANALYSIS RESULTS TABLE
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    input_text TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')) NOT NULL,
    risk_rating VARCHAR(50) DEFAULT 'low' CHECK (risk_rating IN ('low', 'medium', 'high', 'critical')) NOT NULL,
    workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
    executed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    agent_logs JSONB DEFAULT '[]'::jsonb NOT NULL, -- Detailed steps executed by each swarm agent
    final_report TEXT, -- Sourced markdown or structured report text
    error_message TEXT, -- Diagnostics in case of failure
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL, -- Latency, token counts, model details
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for Analysis Results
CREATE INDEX IF NOT EXISTS idx_analysis_results_workflow ON analysis_results(workflow_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_executed_by ON analysis_results(executed_by);
CREATE INDEX IF NOT EXISTS idx_analysis_results_status ON analysis_results(status);
CREATE INDEX IF NOT EXISTS idx_analysis_results_risk ON analysis_results(risk_rating);
CREATE INDEX IF NOT EXISTS idx_analysis_results_created_at ON analysis_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_results_metadata ON analysis_results USING gin (metadata);

-- Trigger for Analysis Results updated_at
CREATE TRIGGER update_analysis_results_modtime
    BEFORE UPDATE ON analysis_results
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
