import { supabase } from '@/lib/supabaseClient';

export async function getActiveUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return user;
  } catch (e) {
    console.warn('supabase.auth.getUser notice:', e);
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('zaya_intern_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.user) return parsed.user;
      }
    } catch (e) {
      console.warn('localStorage zaya_intern_session parse notice:', e);
    }
  }

  return null;
}
