-- Direct fix for ramuji@gmail.com email verification in auth.users
-- This addresses the data inconsistency where profiles shows verified but auth.users shows unverified

-- First, let's check current state before update
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Get current state
    SELECT email, email_confirmed_at, confirmed_at INTO user_record
    FROM auth.users 
    WHERE email = 'ramuji@gmail.com';
    
    RAISE NOTICE 'Before update - Email: %, email_confirmed_at: %, confirmed_at: %', 
        user_record.email, user_record.email_confirmed_at, user_record.confirmed_at;
        
    -- Update auth.users to match profiles table verification status
    UPDATE auth.users 
    SET 
        email_confirmed_at = '2025-09-10 12:23:36.423+00'::timestamptz,
        confirmed_at = '2025-09-10 12:23:36.423+00'::timestamptz,
        updated_at = now()
    WHERE email = 'ramuji@gmail.com';
    
    -- Verify the update
    SELECT email, email_confirmed_at, confirmed_at INTO user_record
    FROM auth.users 
    WHERE email = 'ramuji@gmail.com';
    
    RAISE NOTICE 'After update - Email: %, email_confirmed_at: %, confirmed_at: %', 
        user_record.email, user_record.email_confirmed_at, user_record.confirmed_at;
        
    RAISE NOTICE 'Email verification sync completed for ramuji@gmail.com';
END $$;