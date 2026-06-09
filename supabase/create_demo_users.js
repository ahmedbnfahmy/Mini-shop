const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (e.g. from backend/.env)');
  process.exit(1);
}

async function createUser(email, password, role, name) {
  console.log(`\nCreating user: ${email} (Role: ${role})`);
  
  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Failed to create user ${email}:`, errorText);
    return;
  }

  const data = await response.json();
  console.log(`✅ Successfully created user: ${email} (ID: ${data.id})`);
}

async function run() {
  console.log('🚀 Starting demo user creation...');
  
  // 1. Create Demo Customer
  await createUser(
    'customer@minishop.com',
    'password123',
    'customer',
    'Demo Customer'
  );

  // 2. Create Admin User
  await createUser(
    'admin@minishop.com',
    'admin123',
    'admin',
    'Admin User'
  );

  console.log('\n🎉 Finished creating demo users.');
}

run().catch(console.error);
