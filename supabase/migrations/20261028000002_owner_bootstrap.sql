-- ============================================================================
-- LostGit Pay: Auth Triggers & Owner Bootstrap Migration
-- Migration: 20261028000002_owner_bootstrap.sql
-- ============================================================================

-- Function: Handle new user creation in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    owner_count INT;
    assigned_role TEXT;
BEGIN
    -- Check if any owner exists
    SELECT COUNT(*) INTO owner_count FROM public.profiles WHERE role = 'owner';
    
    -- The first user to ever register becomes the owner
    IF owner_count = 0 THEN
        assigned_role := 'owner';
    ELSE
        -- Check if role was specified in user metadata
        assigned_role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
        -- Ensure only valid roles
        IF assigned_role NOT IN ('owner', 'admin', 'finance', 'support', 'client') THEN
            assigned_role := 'client';
        END IF;
    END IF;

    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        client_id,
        phone,
        avatar_url,
        is_active
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        assigned_role,
        (NEW.raw_user_meta_data->>'client_id')::UUID,
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'avatar_url',
        true
    )
    ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Stored procedure to manually bootstrap or promote an owner
CREATE OR REPLACE FUNCTION public.bootstrap_owner(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET role = 'owner', is_active = true, updated_at = NOW()
    WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
