// Run SQL migrations against Supabase
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (e.g. from backend/.env)');
  process.exit(1);
}

async function runSQL(sql, label) {
  console.log(`\n🔄 Running: ${label}...`);
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({ query: sql }),
  });

  // Use the pg_net approach via supabase-js instead
  // Actually, let's use the Supabase Management API or direct pg connection
  // The REST API doesn't support raw SQL. Let's use a different approach.
  
  console.log(`Status: ${response.status}`);
  const text = await response.text();
  console.log(`Response: ${text.substring(0, 200)}`);
}

// Alternative: Use supabase-js with service role to call rpc
async function runMigration() {
  // Read SQL files
  const schema = fs.readFileSync(path.join(__dirname, 'migrations/001_schema.sql'), 'utf8');
  const rls = fs.readFileSync(path.join(__dirname, 'migrations/002_rls_policies.sql'), 'utf8');
  const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');

  console.log('📋 SQL files loaded successfully');
  console.log(`   Schema: ${schema.length} chars`);
  console.log(`   RLS: ${rls.length} chars`);
  console.log(`   Seed: ${seed.length} chars`);
  console.log('\n⚠️  The Supabase REST API does not support raw SQL execution.');
  console.log('📌 Please run these SQL files in your Supabase Dashboard SQL Editor:');
  console.log('   1. Go to: https://supabase.com/dashboard/project/ltthwcbdwsiqauywhdby/sql/new');
  console.log('   2. Paste and run: supabase/migrations/001_schema.sql');
  console.log('   3. Paste and run: supabase/migrations/002_rls_policies.sql');
  console.log('   4. Paste and run: supabase/seed.sql');
  console.log('\n   Then create the trigger and demo accounts manually (see below).');
}

runMigration().catch(console.error);
