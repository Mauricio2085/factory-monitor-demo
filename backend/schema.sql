-- Drop tables if exist (for clean reinstall)
DROP TABLE IF EXISTS quality_checks CASCADE;
DROP TABLE IF EXISTS downtime_events CASCADE;
DROP TABLE IF EXISTS production_runs CASCADE;
DROP TABLE IF EXISTS production_lines CASCADE;

-- Production Lines
CREATE TABLE production_lines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    target_cycle_time INTEGER NOT NULL, -- seconds
    target_units_per_hour INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Production Runs
CREATE TABLE production_runs (
    id SERIAL PRIMARY KEY,
    line_id INTEGER REFERENCES production_lines(id) ON DELETE CASCADE,
    shift VARCHAR(20) NOT NULL, -- 'morning', 'afternoon', 'night'
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    target_quantity INTEGER NOT NULL,
    actual_quantity INTEGER DEFAULT 0,
    good_quantity INTEGER DEFAULT 0,
    defect_quantity INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'running', -- 'running', 'stopped', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Downtime Events
CREATE TABLE downtime_events (
    id SERIAL PRIMARY KEY,
    line_id INTEGER REFERENCES production_lines(id) ON DELETE CASCADE,
    run_id INTEGER REFERENCES production_runs(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- 'breakdown', 'setup', 'no_operator', 'starved', 'blocked'
    reason TEXT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_minutes INTEGER,
    resolved_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quality Checks
CREATE TABLE quality_checks (
    id SERIAL PRIMARY KEY,
    line_id INTEGER REFERENCES production_lines(id) ON DELETE CASCADE,
    run_id INTEGER REFERENCES production_runs(id) ON DELETE CASCADE,
    check_time TIMESTAMP NOT NULL,
    defect_type VARCHAR(100), -- NULL if passed
    defect_count INTEGER DEFAULT 0,
    inspector VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_production_runs_line_id ON production_runs(line_id);
CREATE INDEX idx_production_runs_start_time ON production_runs(start_time);
CREATE INDEX idx_downtime_events_line_id ON downtime_events(line_id);
CREATE INDEX idx_downtime_events_start_time ON downtime_events(start_time);
CREATE INDEX idx_quality_checks_line_id ON quality_checks(line_id);
CREATE INDEX idx_quality_checks_check_time ON quality_checks(check_time);

-- Comments for documentation
COMMENT ON TABLE production_lines IS 'Manufacturing production lines configuration';
COMMENT ON TABLE production_runs IS 'Individual production runs per shift';
COMMENT ON TABLE downtime_events IS 'Equipment downtime tracking for MTBF/MTTR calculation';
COMMENT ON TABLE quality_checks IS 'Quality inspection results for FPY calculation';

-- Insert sample production lines
INSERT INTO production_lines (name, description, target_cycle_time, target_units_per_hour, is_active) VALUES
('Line A - Assembly', 'Main assembly line for product series A', 45, 80, true),
('Line B - Packaging', 'High-speed packaging line', 30, 120, true),
('Line C - Quality Control', 'Final inspection and testing line', 60, 60, true);

-- Insert sample production runs (current shift)
INSERT INTO production_runs (line_id, shift, start_time, target_quantity, actual_quantity, good_quantity, status) VALUES
(1, 'morning', NOW() - INTERVAL '3 hours', 240, 180, 170, 'running'),
(2, 'morning', NOW() - INTERVAL '3 hours', 360, 290, 285, 'running'),
(3, 'morning', NOW() - INTERVAL '3 hours', 180, 140, 135, 'running');

-- Insert sample downtime events
INSERT INTO downtime_events (line_id, run_id, category, reason, start_time, end_time, duration_minutes, resolved_by) VALUES
(1, 1, 'breakdown', 'Conveyor belt motor failure', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '90 minutes', 30, 'John Smith'),
(2, 2, 'setup', 'Product changeover to new SKU', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '45 minutes', 15, 'Maria Garcia'),
(1, 1, 'starved', 'Waiting for raw materials from warehouse', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '30 minutes', 15, 'Operations Team');

-- Insert sample quality checks
INSERT INTO quality_checks (line_id, run_id, check_time, defect_type, defect_count, inspector) VALUES
(1, 1, NOW() - INTERVAL '2 hours', NULL, 0, 'QC Team A'),
(1, 1, NOW() - INTERVAL '90 minutes', 'Surface scratch', 5, 'QC Team A'),
(2, 2, NOW() - INTERVAL '1 hour', 'Label misalignment', 3, 'QC Team B'),
(3, 3, NOW() - INTERVAL '45 minutes', NULL, 0, 'QC Team C'),
(3, 3, NOW() - INTERVAL '30 minutes', 'Dimension out of spec', 2, 'QC Team C');