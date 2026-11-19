# CNIC Authentication

Employer and Worker registration requires a Pakistani CNIC. The API strips spaces and hyphens, validates exactly 13 digits, and stores the normalized value as a string in `users.cnic`. A unique index prevents reuse. Login accepts CNIC and password and returns the same generic credential error for an unknown CNIC or incorrect password.

Email remains the account contact and password recovery identity. Password hashes, access JWTs, refresh token rotation, and role authorization continue through the existing authentication system. Public profile and sanitized auth responses omit CNIC. CNIC is an account identifier only; it does not mark identity or documents as verified.

The migration adds the CNIC column without assigning fabricated data. Existing Admin accounts may remain without CNIC. Database role assignment triggers require a valid CNIC for Employer and Worker roles and prevent removing it from those accounts. Existing Employer or Worker accounts without a CNIC must have their real CNIC recorded through a verified administrative remediation before using CNIC login.
