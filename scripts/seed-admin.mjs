import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local", {url: !!url, service: !!serviceKey});
  process.exit(1);
}

const supabaseAdmin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  const email = 'admin@bestcar.com';
  const password = 'adminpassword123';

  console.log(`Creating initial admin user: ${email}`);
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email, password, email_confirm: true
  });

  let userId = userData?.user?.id;
  if (userError) {
    if (!userError.message.includes('already been registered')) {
        return console.error("Error creating user:", userError);
    }
    console.log("User might already exist. Assigning role...");
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const existing = users.find(u => u.email === email);
    if (existing) userId = existing.id;
  } else console.log("User created successfully:", userId);

  if (userId) {
     const { error: roleError } = await supabaseAdmin.from('user_roles').insert([{ user_id: userId, role: 'admin' }]);
     if (roleError && roleError.code !== '23505') console.error("Error assigning role:", roleError);
     else {
         console.log("Role administrative 'admin' assigned successfully.");
         console.log("\n=== SUCCESS ===");
         console.log(`Email: ${email}\nPassword: ${password}`);
     }
  }
}
main();
