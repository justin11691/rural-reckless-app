import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConfig() {
  console.log('Checking Supabase configuration...');
  
  // Check avatars bucket
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (bucketError) {
    console.error('Error fetching buckets:', bucketError.message);
  } else {
    const hasAvatars = buckets.some(b => b.name === 'avatars');
    console.log(`[${hasAvatars ? 'SUCCESS' : 'FAIL'}] Bucket 'avatars' exists: ${hasAvatars}`);
  }

  // Check profiles table for music_url
  const { data: profiles, error: profileError } = await supabase.from('profiles').select('*').limit(1);
  if (profileError) {
    console.error('Error fetching profiles:', profileError.message);
  } else {
    // If the table is empty, we still get an empty array.
    // We can insert a dummy and rollback, or just assume success if no error is thrown
    // when explicitly selecting music_url
    const { error: columnError } = await supabase.from('profiles').select('music_url').limit(1);
    if (columnError) {
      console.log(`[FAIL] Column 'music_url' check failed: ${columnError.message}`);
    } else {
      console.log(`[SUCCESS] Column 'music_url' exists.`);
    }
  }
}

checkConfig();
