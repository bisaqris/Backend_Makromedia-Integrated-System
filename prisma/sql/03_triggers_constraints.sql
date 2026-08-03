-- ============================================================================
--  Makromedia Integrated System — Triggers & Constraints (SDD §2.3.8 - §2.3.12)
-- ============================================================================

-- ----------------------------------------------------------------------------
--  CHECK constraints (SDD §2.3.12)
-- ----------------------------------------------------------------------------
ALTER TABLE tasks
    DROP CONSTRAINT IF EXISTS chk_task_progress,
    ADD  CONSTRAINT chk_task_progress CHECK (progress BETWEEN 0 AND 100);

ALTER TABLE project_progress
    DROP CONSTRAINT IF EXISTS chk_progress_percentage,
    ADD  CONSTRAINT chk_progress_percentage CHECK (percentage BETWEEN 0 AND 100);

-- ----------------------------------------------------------------------------
--  2.3.8  Auto-update timestamp saat task diubah
--  (Prisma @updatedAt hanya berjalan via Prisma Client; trigger ini menjamin
--   konsistensi bila update dilakukan langsung lewat SQL/procedure.)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS before_update_task ON tasks;
CREATE TRIGGER before_update_task
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- 2.3.9  Auto-update timestamp saat project diubah
DROP TRIGGER IF EXISTS before_update_project ON projects;
CREATE TRIGGER before_update_project
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- ----------------------------------------------------------------------------
--  Auto-calculate sub_total pada quotation & invoice item
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_calc_item_subtotal()
RETURNS TRIGGER AS $$
BEGIN
    NEW.sub_total = NEW.unit_price * NEW.quantity * NEW.frequency;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS before_write_quotation_item ON quotation_items;
CREATE TRIGGER before_write_quotation_item
    BEFORE INSERT OR UPDATE ON quotation_items
    FOR EACH ROW EXECUTE FUNCTION trg_calc_item_subtotal();

DROP TRIGGER IF EXISTS before_write_invoice_item ON invoice_items;
CREATE TRIGGER before_write_invoice_item
    BEFORE INSERT OR UPDATE ON invoice_items
    FOR EACH ROW EXECUTE FUNCTION trg_calc_item_subtotal();

-- Auto-calculate amount pada production_cost
CREATE OR REPLACE FUNCTION trg_calc_cost_amount()
RETURNS TRIGGER AS $$
BEGIN
    NEW.amount = NEW.unit_price * NEW.quantity * NEW.frequency;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS before_write_production_cost ON production_costs;
CREATE TRIGGER before_write_production_cost
    BEFORE INSERT OR UPDATE ON production_costs
    FOR EACH ROW EXECUTE FUNCTION trg_calc_cost_amount();
