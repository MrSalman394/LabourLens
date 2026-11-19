-- Enforce CNIC for worker/employer role assignments while allowing legacy
-- administrator accounts to be remediated without fabricating identity data.
CREATE FUNCTION require_cnic_for_worker_employer_role()
RETURNS TRIGGER AS $$
DECLARE
  target_role_code VARCHAR(50);
  target_cnic VARCHAR(13);
BEGIN
  SELECT code INTO target_role_code FROM roles WHERE id = NEW.role_id;
  IF target_role_code IN ('EMPLOYER', 'WORKER') THEN
    SELECT cnic INTO target_cnic FROM users WHERE id = NEW.user_id;
    IF target_cnic IS NULL OR target_cnic !~ '^[0-9]{13}$' THEN
      RAISE EXCEPTION 'A valid CNIC is required for Employer and Worker accounts'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_role_requires_cnic
BEFORE INSERT OR UPDATE OF user_id, role_id ON user_role_assignments
FOR EACH ROW EXECUTE FUNCTION require_cnic_for_worker_employer_role();

-- Prevent a populated worker/employer account from later clearing its CNIC.
CREATE FUNCTION prevent_cnic_removal_from_worker_employer()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cnic IS NULL AND OLD.cnic IS NOT NULL AND EXISTS (
    SELECT 1
    FROM user_role_assignments assignment
    JOIN roles role ON role.id = assignment.role_id
    WHERE assignment.user_id = OLD.id
      AND role.code IN ('EMPLOYER', 'WORKER')
  ) THEN
    RAISE EXCEPTION 'CNIC cannot be removed from an Employer or Worker account'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER worker_employer_cnic_required
BEFORE UPDATE OF cnic ON users
FOR EACH ROW EXECUTE FUNCTION prevent_cnic_removal_from_worker_employer();
