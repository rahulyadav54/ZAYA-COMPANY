import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function promoteAdmin() {
  const email = 'shiva@zayacodehub.in';
  
  console.log(`🔍 Searching for profile with email: ${email}...`);
  
  // Try to find the profile first
  const { data: profile, error: searchError } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('email', email)
    .single();

  if (searchError) {
    console.error('❌ Could not find a profile for this email. Make sure the user has signed up or been added to the Auth list first.');
    return;
  }

  console.log(`✅ Found user: ${profile.full_name} (Current Role: ${profile.role})`);

  if (profile.role === 'admin') {
    console.log('✨ User is already an admin!');
    return;
  }

  console.log('🚀 Upgrading user to admin...');
  
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', profile.id);

  if (updateError) {
    console.error('❌ Error upgrading user:', updateError.message);
    console.log('💡 Note: You may need to update your RLS policies to allow this update via the API.');
  } else {
    console.log(`🎊 Success! ${profile.full_name} is now an Admin!`);
  }
}

promoteAdmin();
