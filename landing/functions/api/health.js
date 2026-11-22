/**
 * Cloudflare Edge Worker: Health & Upkeep Check
 * Route: /api/health
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  const cf = request.cf || {};

  const healthData = {
    status: 'healthy',
    service: 'Rural & Reckless Media API',
    uptime: 'operational',
    timestamp: new Date().toISOString(),
    edge: {
      colo: cf.colo || 'DEV',
      country: cf.country || 'US',
      city: cf.city || 'Unknown',
      timezone: cf.timezone || 'America/Phoenix',
      httpProtocol: cf.httpProtocol || 'HTTP/2'
    },
    security: {
      tlsVersion: cf.tlsVersion || 'TLSv1.3',
      botManagement: cf.botManagement ? cf.botManagement.score : 'active'
    }
  };

  return new Response(JSON.stringify(healthData, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
