-- ==============================================================================
-- Rural & Reckless Database Security Hardening & RLS Policy Migration
-- File: supabase/migrations/20261122000000_security_and_rls_hardening.sql
-- ==============================================================================

-- 1. Ensure `leads` table exists for Edge Ingestion (/api/contact)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    business TEXT,
    phone TEXT,
    message TEXT NOT NULL,
    source TEXT DEFAULT 'ruralandreckless_cf_edge',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Allow public insert for leads" ON public.leads;
DROP POLICY IF EXISTS "Service role can view leads" ON public.leads;

-- Public-insert-only policy for edge worker and contact forms
CREATE POLICY "Allow public insert for leads"
    ON public.leads
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Disallow public reads; only service_role (backend) or dashboard admins can read leads
CREATE POLICY "Service role can view leads"
    ON public.leads
    FOR SELECT
    TO service_role
    USING (true);


-- 2. Profiles Table Hardening
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles
    FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);


-- 3. Posts Table Hardening
ALTER TABLE IF EXISTS public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;

CREATE POLICY "Posts are viewable by everyone"
    ON public.posts
    FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own posts"
    ON public.posts
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
    ON public.posts
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
    ON public.posts
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);


-- 4. Post Likes Table Hardening
ALTER TABLE IF EXISTS public.post_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.post_likes;
DROP POLICY IF EXISTS "Users can insert own likes" ON public.post_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.post_likes;

CREATE POLICY "Likes are viewable by everyone"
    ON public.post_likes
    FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own likes"
    ON public.post_likes
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
    ON public.post_likes
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);


-- 5. Post Comments Table Hardening
ALTER TABLE IF EXISTS public.post_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.post_comments;
DROP POLICY IF EXISTS "Users can insert own comments" ON public.post_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.post_comments;

CREATE POLICY "Comments are viewable by everyone"
    ON public.post_comments
    FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own comments"
    ON public.post_comments
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
    ON public.post_comments
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);


-- 6. Communities Table Hardening
ALTER TABLE IF EXISTS public.communities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Communities are viewable by everyone" ON public.communities;
DROP POLICY IF EXISTS "Users can create communities" ON public.communities;
DROP POLICY IF EXISTS "Owners can update their communities" ON public.communities;

CREATE POLICY "Communities are viewable by everyone"
    ON public.communities
    FOR SELECT
    USING (is_public = true OR auth.uid() = owner_id);

CREATE POLICY "Users can create communities"
    ON public.communities
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their communities"
    ON public.communities
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);


-- 7. Group Members Table Hardening
ALTER TABLE IF EXISTS public.group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Group members are viewable by community viewers" ON public.group_members;
DROP POLICY IF EXISTS "Users can join communities" ON public.group_members;
DROP POLICY IF EXISTS "Users can update or leave community membership" ON public.group_members;

CREATE POLICY "Group members are viewable by community viewers"
    ON public.group_members
    FOR SELECT
    USING (true);

CREATE POLICY "Users can join communities"
    ON public.group_members
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update or leave community membership"
    ON public.group_members
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);


-- 8. Market Listings Table Hardening
ALTER TABLE IF EXISTS public.market_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active listings are viewable by everyone" ON public.market_listings;
DROP POLICY IF EXISTS "Users can create listings" ON public.market_listings;
DROP POLICY IF EXISTS "Sellers can update own listings" ON public.market_listings;
DROP POLICY IF EXISTS "Sellers can delete own listings" ON public.market_listings;

CREATE POLICY "Active listings are viewable by everyone"
    ON public.market_listings
    FOR SELECT
    USING (is_active = true OR auth.uid() = user_id);

CREATE POLICY "Users can create listings"
    ON public.market_listings
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sellers can update own listings"
    ON public.market_listings
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Sellers can delete own listings"
    ON public.market_listings
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);


-- 9. Digital Products Table Hardening
ALTER TABLE IF EXISTS public.digital_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active digital products are viewable by everyone" ON public.digital_products;
DROP POLICY IF EXISTS "Users can create digital products" ON public.digital_products;
DROP POLICY IF EXISTS "Owners can update own digital products" ON public.digital_products;
DROP POLICY IF EXISTS "Owners can delete own digital products" ON public.digital_products;

CREATE POLICY "Active digital products are viewable by everyone"
    ON public.digital_products
    FOR SELECT
    USING (is_active = true OR auth.uid() = owner_id);

CREATE POLICY "Users can create digital products"
    ON public.digital_products
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own digital products"
    ON public.digital_products
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own digital products"
    ON public.digital_products
    FOR DELETE
    TO authenticated
    USING (auth.uid() = owner_id);


-- 10. Messages Table Hardening (Strict E2E privacy)
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only read messages sent to or by them" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Receivers can mark messages as read" ON public.messages;

CREATE POLICY "Users can only read messages sent to or by them"
    ON public.messages
    FOR SELECT
    TO authenticated
    USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
    ON public.messages
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receivers can mark messages as read"
    ON public.messages
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = receiver_id)
    WITH CHECK (auth.uid() = receiver_id);
