-- Direct fix for ramuji@gmail.com email verification in auth.users
-- Only update email_confirmed_at as confirmed_at is a generated column

UPDATE auth.users 
SET 
    email_confirmed_at = '2025-09-10 12:23:36.423+00'::timestamptz,
    updated_at = now()
WHERE email = 'ramuji@gmail.com';

-- Verify the update worked
SELECT email, email_confirmed_at, confirmed_at 
FROM auth.users 
WHERE email = 'ramuji@gmail.com';