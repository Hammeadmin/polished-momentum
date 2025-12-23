-- Migration: Create Dashboard KPI View
-- Created: 2025-12-22
-- Purpose: Pre-calculate dashboard KPIs for performance optimization

-- Drop existing view if it exists
DROP VIEW IF EXISTS view_dashboard_kpis;

-- Create the optimized KPI view
-- This view pre-calculates aggregations that were previously run as 4 separate queries
CREATE VIEW view_dashboard_kpis AS
SELECT
  organisation_id,
  (
    SELECT COALESCE(SUM(i.amount), 0) 
    FROM invoices i 
    WHERE i.organisation_id = o.id 
    AND i.status = 'paid'
  ) as total_sales,
  (
    SELECT COUNT(*) 
    FROM leads l 
    WHERE l.organisation_id = o.id 
    AND l.status NOT IN ('won', 'lost')
  ) as active_leads,
  (
    SELECT COUNT(*) 
    FROM jobs j 
    WHERE j.organisation_id = o.id 
    AND j.status IN ('pending', 'in_progress')
  ) as active_jobs,
  (
    SELECT COUNT(*) 
    FROM invoices i 
    WHERE i.organisation_id = o.id 
    AND i.status = 'overdue'
  ) as overdue_invoices
FROM organisations o;

-- Grant appropriate permissions
GRANT SELECT ON view_dashboard_kpis TO authenticated;

-- Add comment for documentation
COMMENT ON VIEW view_dashboard_kpis IS 'Pre-calculated dashboard KPI metrics per organisation';
