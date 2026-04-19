import { supabase } from './src/lib/supabaseClient';

async function checkColumns() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error('Error fetching profiles:', error);
  } else if (data && data.length > 0) {
    console.log('Columns in profiles:', Object.keys(data[0]));
  } else {
    console.log('No data in profiles table to check columns.');
  }
  
  const { data: appData, error: appError } = await supabase.from('applications').select('*').limit(1);
  if (appError) {
    console.error('Error fetching applications:', appError);
  } else if (appData && appData.length > 0) {
    console.log('Columns in applications:', Object.keys(appData[0]));
  }
}

checkColumns();
