// Script to auto-confirm all unconfirmed users
const https = require('https');

const SUPABASE_URL = 'https://cfzyflspnniwlkjqsmzk.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmenlmbHNwbm5pd2xranFzbXprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE0MDc5MSwiZXhwIjoyMDg1NzE2NzkxfQ.9WKfu7w8-B3KbQP28fBP44Pec8N2QJu4WW_2QoLljwk';

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);
    const payload = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function main() {
  // Get all auth users
  const { body } = await request('GET', '/auth/v1/admin/users?page=1&per_page=50');
  const users = body.users || [];
  
  for (const user of users) {
    if (!user.email_confirmed_at) {
      console.log(`Confirming ${user.email}...`);
      const res = await request('PUT', `/auth/v1/admin/users/${user.id}`, {
        email_confirm: true,
      });
      if (res.status === 200) {
        console.log(`  ✅ Confirmed`);
      } else {
        console.log(`  ❌ Failed: ${JSON.stringify(res.body)}`);
      }
    } else {
      console.log(`${user.email} already confirmed`);
    }
  }
  
  // Also ensure public.users has records for all auth users
  console.log('\nChecking public.users records...');
  const pubRes = await request('GET', '/rest/v1/users?select=id,email,auth_user_id');
  const pubUsers = Array.isArray(pubRes.body) ? pubRes.body : [];
  
  for (const authUser of users) {
    const pubUser = pubUsers.find(u => u.email === authUser.email);
    if (!pubUser) {
      console.log(`Creating public.users record for ${authUser.email}...`);
      const createRes = await request('POST', '/rest/v1/users', {
        email: authUser.email,
        auth_user_id: authUser.id,
      });
      if (createRes.status === 201) {
        console.log(`  ✅ Created`);
      } else {
        console.log(`  ❌ Failed (${createRes.status}): ${JSON.stringify(createRes.body)}`);
      }
    } else if (!pubUser.auth_user_id) {
      console.log(`Linking auth_user_id for ${authUser.email}...`);
      const updateRes = await request('PATCH', `/rest/v1/users?id=eq.${pubUser.id}`, {
        auth_user_id: authUser.id,
      });
      console.log(`  Status: ${updateRes.status}`);
    } else {
      console.log(`${authUser.email} - public record OK`);
    }
  }
}

main().catch(console.error);
