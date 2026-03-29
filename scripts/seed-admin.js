import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read .env.local manually for the script
const envLocalPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envLocalPath, 'utf8');

const envs = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envs[match[1].trim()] = match[2].trim();
  }
});

const url = envs['NEXT_PUBLIC_SUPABASE_URL'];
const serviceKey = envs['SUPABASE_SERVICE_ROLE_KEY'];

if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(url, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  const email = 'admin@bestcar.com';
  const password = 'adminpassword123';

  console.log(`Creating initial admin user: ${email}`);

  // 1. Create User in Supabase Auth using the admin API
  const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true // bypass email confirmation
  });

  if (userError) {
    console.error("Error creating user:", userError);
    if (!userError.message.includes('already been registered')) {
        return;
    }
    console.log("User might already exist. Trying to assign role anyway...");
  } else {
    console.log("User created successfully:", userData.user.id);
  }

  // 2. We need the ID to assign the role. Fetch it if it existed.
  let userId = userData?.user?.id;
  if (!userId) {
     const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
     const existingAdmin = usersData?.users.find(u => u.email === email);
     if (existingAdmin) userId = existingAdmin.id;
  }

  if (userId) {
     // 3. Assign Role in user_roles
     const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert([{ user_id: userId, role: 'admin' }]);
     
     if (roleError && roleError.code !== '23505') { // ignore duplicate key exception
         console.error("Error assigning role:", roleError);
     } else {
         console.log("Role administrative 'admin' assigned to the user successfully.");
         console.log("\n=== SUCCESS ===");
         console.log(`Email: ${email}`);
         console.log(`Password: ${password}`);
     }
  }
}

main();
