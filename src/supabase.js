import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gpdtsafjcawlxnongxuf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwZHRzYWZqY2F3bHhub25neHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MTA3MjMsImV4cCI6MjA5NzE4NjcyM30.ZB81-WwE-nBfMs8SnmCAjg4ElrxAZ0p1g6lSLZdzlM0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Verifica sessão do admin
export async function getAdminSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function signInAdmin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signOutAdmin() {
  await supabase.auth.signOut();
}
