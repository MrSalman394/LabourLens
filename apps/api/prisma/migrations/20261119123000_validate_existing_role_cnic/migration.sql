-- Fail safely before continuing on a deployment with legacy Employer/Worker
-- accounts missing a CNIC. Never print account identifiers or CNIC values.
DO $$
DECLARE
  invalid_account_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO invalid_account_count
  FROM user_role_assignments assignment
  JOIN roles role ON role.id = assignment.role_id
  JOIN users account ON account.id = assignment.user_id
  WHERE role.code IN ('EMPLOYER', 'WORKER')
    AND (account.cnic IS NULL OR account.cnic !~ '^[0-9]{13}$');

  IF invalid_account_count > 0 THEN
    RAISE EXCEPTION 'CNIC migration blocked: % existing Employer/Worker accounts need CNIC remediation', invalid_account_count;
  END IF;
END;
$$;
