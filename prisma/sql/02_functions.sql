-- ============================================================================
--  Makromedia Integrated System — Functions & Procedures (SDD §2.3.4 - §2.3.7)
-- ============================================================================

-- 2.3.4  Total biaya produksi (APPROVED) untuk sebuah proyek
CREATE OR REPLACE FUNCTION fn_total_production_cost(p_project_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_cost DECIMAL;
BEGIN
    SELECT COALESCE(SUM(amount), 0)
    INTO total_cost
    FROM production_costs
    WHERE project_id = p_project_id
      AND status = 'APPROVED';
    RETURN total_cost;
END;
$$ LANGUAGE plpgsql;

-- 2.3.5  Rata-rata progress task dalam sebuah proyek
CREATE OR REPLACE FUNCTION fn_project_progress(p_project_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    avg_progress NUMERIC;
BEGIN
    SELECT COALESCE(AVG(progress), 0)
    INTO avg_progress
    FROM tasks
    WHERE project_id = p_project_id;
    RETURN ROUND(avg_progress, 2);
END;
$$ LANGUAGE plpgsql;

-- 2.3.6  Tambah anggota (crew/user) ke proyek
CREATE OR REPLACE PROCEDURE sp_add_project_member(
    p_project_id UUID,
    p_user_id    UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO project_members (id, project_id, user_id, joined_at)
    VALUES (gen_random_uuid(), p_project_id, p_user_id, NOW())
    ON CONFLICT (project_id, user_id) DO NOTHING;
END;
$$;

-- 2.3.7  Buat invoice dari quotation yang telah disetujui
CREATE OR REPLACE PROCEDURE sp_create_invoice(
    p_project_id      UUID,
    p_quotation_id    UUID,
    p_created_by      UUID,
    p_invoice_number  VARCHAR,
    p_amount          DECIMAL,
    p_due_date        DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO invoices (
        id, project_id, quotation_id, created_by,
        invoice_number, amount, status, due_date, created_at, updated_at
    )
    VALUES (
        gen_random_uuid(), p_project_id, p_quotation_id, p_created_by,
        p_invoice_number, p_amount, 'DRAFT', p_due_date, NOW(), NOW()
    );
END;
$$;
