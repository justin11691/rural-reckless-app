/**
 * Cloudflare Edge Worker: Secure Lead & Contact Ingestion
 * Route: /api/contact
 * Handles project estimates and general inquiries securely at the edge.
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  // Handle CORS
  const origin = request.headers.get('Origin') || '*';
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=utf-8'
  };

  try {
    const data = await request.json();
    const { name, email, message, source, business, phone } = data;

    // 1. Honeypot anti-spam verification
    if (data.website_trap || data.website || data._gotcha) {
      // Silently accept bots without persisting
      return new Response(JSON.stringify({ success: true, message: 'Inquiry received' }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // 2. Strict Input Validation & Sanitization
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return new Response(JSON.stringify({ success: false, error: 'A valid email address is required.' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const cleanName = (name || 'Anonymous Client').replace(/[<>]/g, '').trim().slice(0, 120);
    const cleanEmail = email.trim().toLowerCase().slice(0, 120);
    const cleanBusiness = (business || '').replace(/[<>]/g, '').trim().slice(0, 160);
    const cleanSource = (source || 'ruralandreckless_cf_edge').replace(/[<>]/g, '').trim().slice(0, 80);
    const cleanMessage = (message || (cleanBusiness ? 'Business inquiry: ' + cleanBusiness : 'New Lead')).replace(/[<>]/g, '').trim().slice(0, 5000);

    const payload = {
      name: cleanName,
      email: cleanEmail,
      message: cleanMessage,
      source: cleanSource,
      created_at: new Date().toISOString()
    };

    // 3. Environment & Secrets: Read strictly from env bindings
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY || env.SUPABASE_KEY || env.SUPABASE_ANON_KEY;

    let dbSaved = false;
    if (supabaseUrl && supabaseKey) {
      try {
        const dbRes = await fetch(`${supabaseUrl}/rest/v1/leads`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(payload)
        });
        if (dbRes.ok) dbSaved = true;
      } catch (e) {
        console.error('Edge Supabase persistence error:', e);
      }
    }

    // 4. Transactional email notification via Cloudflare MailChannels (if available)
    const notificationEmail = env.LEADS_EMAIL || 'info@ruralandreckless.com';
    try {
      await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: notificationEmail, name: 'Justin @ Rural & Reckless' }]
            }
          ],
          from: {
            email: 'leads@ruralandreckless.com',
            name: 'Rural & Reckless Edge Leads'
          },
          subject: `New Lead: ${payload.name} (${payload.source})`,
          content: [
            {
              type: 'text/plain',
              value: `New project lead received on ruralandreckless.com!\n\nName: ${payload.name}\nEmail: ${payload.email}\nSource: ${payload.source}\n\nDetails:\n${payload.message}\n\nTimestamp: ${payload.created_at}`
            }
          ]
        })
      });
    } catch (mailErr) {
      // Optional MailChannels notification fallback
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Your inquiry has been received. Justin will be in touch shortly!',
      dbSaved: dbSaved,
      colo: request.cf?.colo || 'EDGE'
    }), {
      status: 200,
      headers: corsHeaders
    });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Unable to process submission at this time. Please email info@ruralandreckless.com directly.'
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
