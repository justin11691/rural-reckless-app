const url = 'https://crjfaoxwlmqubmpsyodo.supabase.co';
const key = 'sb_publishable_xmEpKVwFMNn44OVuba7NmQ_QJUpC8xo';

async function check() {
  // Check profile columns
  const res = await fetch(`${url}/rest/v1/profiles?select=music_url&limit=1`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  
  if (res.ok) {
    console.log('[SUCCESS] music_url column exists in profiles table.');
  } else {
    const error = await res.text();
    console.log('[FAIL] music_url column check failed:', error);
  }
}

check();
