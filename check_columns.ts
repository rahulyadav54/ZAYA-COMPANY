import { supabase } from './src/lib/supabaseClient.ts';

async function checkColumns() {
  const { data, error } = await supabase.from('intern_messages').select('*').limit(1);
  if (error) {
    console.error('Error fetching profiles:', error);
  } else if (data && data.length > 0) {
    console.log('Columns in profiles:', Object.keys(data[0]));
  } else {
    console.log('No data in profiles table.');
  }
}

checkColumns();
