-- ============================================================================
--  Makromedia Integrated System — Database Views (SDD §2.3.1 - §2.3.3)
--  Dijalankan SETELAH `prisma migrate` membuat tabel dasar.
-- ============================================================================

-- 2.3.1  Detail proyek beserta client & status
CREATE OR REPLACE VIEW vw_project_detail AS
SELECT
    p.id                AS project_id,
    p.project_name,
    p.status,
    p.category,
    p.contract_value,
    p.start_date,
    p.end_date,
    p.event_date,
    cc.name             AS company_name,
    c.name              AS pic_name,
    pm.name             AS project_manager
FROM projects p
JOIN clients c            ON p.client_id = c.id
JOIN company_clients cc   ON c.company_client_id = cc.id
LEFT JOIN users pm        ON p.project_manager_id = pm.id;

-- 2.3.2  Monitoring task per proyek & user pengerjaan
CREATE OR REPLACE VIEW vw_task_monitoring AS
SELECT
    t.id                AS task_id,
    p.project_name,
    u.name              AS assigned_user,
    t.title,
    t.progress,
    t.status,
    t.due_date
FROM tasks t
JOIN projects p     ON t.project_id = p.id
LEFT JOIN users u   ON t.assigned_to = u.id;

-- 2.3.3  Rekap total biaya produksi (yang sudah APPROVED) per proyek
CREATE OR REPLACE VIEW vw_production_cost_summary AS
SELECT
    p.id                AS project_id,
    p.project_name,
    COALESCE(SUM(pc.amount) FILTER (WHERE pc.status = 'APPROVED'), 0) AS total_approved_cost,
    COALESCE(SUM(pc.amount), 0)                                       AS total_cost,
    p.contract_value,
    (p.contract_value - COALESCE(SUM(pc.amount) FILTER (WHERE pc.status = 'APPROVED'), 0)) AS estimated_profit
FROM projects p
LEFT JOIN production_costs pc ON pc.project_id = p.id
GROUP BY p.id, p.project_name, p.contract_value;
