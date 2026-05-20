-- Deprecated on purpose.
-- This helper exposed account enumeration risk by checking auth.users from a client-callable function.
-- Keep this file only to remove the function safely from existing environments.

drop function if exists public.user_exists_by_email(text);
