import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gpdtsafjcawlxnongxuf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwZHRzYWZqY2F3bHhub25neHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MTA3MjMsImV4cCI6MjA5NzE4NjcyM30.ZB81-WwE-nBfMs8SnmCAjg4ElrxAZ0p1g6lSLZdzlM0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ======================================================
// ADMIN AUTH (existing)
// ======================================================

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

// ======================================================
// CUSTOMER AUTH (V3)
// ======================================================

// Cadastro de cliente
export async function signUpCustomer(email, password, metadata = {}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nome: metadata.nome || '',
        telefone: metadata.telefone || '',
        whatsapp: metadata.whatsapp || '',
      }
    }
  });
  return { data, error };
}

// Login de cliente
export async function signInCustomer(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

// Logout de cliente
export async function signOutCustomer() {
  await supabase.auth.signOut();
}

// Sessão atual do cliente
export async function getCustomerSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Recuperação de senha
export async function resetPassword(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/#/account`
  });
  return { data, error };
}

// Buscar perfil do cliente logado
export async function getProfile() {
  const session = await getCustomerSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error) return null;
  return data;
}

// Atualizar perfil do cliente
export async function updateProfile(updates) {
  const session = await getCustomerSession();
  if (!session) return { error: { message: 'Não autenticado' } };

  const { data, error } = await supabase
    .from('profiles')
    .update({
      nome: updates.nome,
      telefone: updates.telefone,
      whatsapp: updates.whatsapp,
      updated_at: new Date().toISOString()
    })
    .eq('id', session.user.id)
    .select()
    .single();

  return { data, error };
}

// Listener de mudança de auth state
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}
