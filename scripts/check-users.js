// Quick user check script
const https = require('https');

const SUPABASE_URL = 'https://cfzyflspnniwlkjqsmzk.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmenlmbHNwbm5pd2xranFzbXprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE0MDc5MSwiZXhwIjoyMDg1NzE2NzkxfQ.9WKfu7w8-B3KbQP28fBP44Pec8N2QJu4WW_2QoLljwk';

function fetchJSON(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, SUPABASE_URL);
    const opts = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Type': 'application/json',
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
    req.end();
  });
}

async function main() {
  console.log('\n=== AUTH USERS (Supabase Auth) ===');
  const auth = await fetchJSON('/auth/v1/admin/users?page=1&per_page=50');
  if (auth.body.users) {
    auth.body.users.forEach(u => {
      console.log(`  ${u.email} | id: ${u.id} | confirmed: ${!!u.email_confirmed_at} | created: ${u.created_at?.split('T')[0]}`);
    });
  } else {
    console.log('  Error:', JSON.stringify(auth.body));
  }

  console.log('\n=== PUBLIC USERS TABLE ===');
  const pub = await fetchJSON('/rest/v1/users?select=id,email,auth_user_id,created_at&order=created_at.desc');
  if (Array.isArray(pub.body)) {
    pub.body.forEach(u => {
      console.log(`  ${u.email} | name: ${u.name} | auth_user_id: ${u.auth_user_id || 'NULL'} | created: ${u.created_at?.split('T')[0]}`);
    });
  } else {
    console.log('  Error:', JSON.stringify(pub.body));
  }
}

main().catch(console.error);
