// ======================================================
// ADMIN LOGIN PAGE
// ======================================================
import { signInAdmin, getAdminSession } from '../../supabase.js';
import { navigate } from '../../router.js';

export async function renderAdminLogin(container) {
  // Already logged in?
  const session = await getAdminSession();
  if (session) {
    const { getProfile } = await import('../../supabase.js');
    const profile = await getProfile();
    if (profile?.role === 'admin') {
      navigate('/admin/dashboard');
      return;
    }
  }

  document.body.style.padding = '0';
  container.innerHTML = '';
  container.className = '';

  container.innerHTML = `
    <div class="admin-login-page">
      <div class="admin-login-card">
        <div class="admin-login-logo">
          <div class="icon">👑</div>
          <h2>Painel Administrativo</h2>
          <p>Croxiatti Imports</p>
        </div>
        <form class="admin-login-form" id="login-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="admin-email">Email</label>
            <input class="form-input" type="email" id="admin-email" placeholder="admin@email.com" autocomplete="email" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="admin-pass">Senha</label>
            <input class="form-input" type="password" id="admin-pass" placeholder="••••••••" autocomplete="current-password" required />
          </div>
          <div id="login-error" style="display:none" class="login-error"></div>
          <button type="submit" class="btn btn-primary btn-full" id="login-btn" style="margin-top:8px">
            Entrar no Painel
          </button>
        </form>
        <p style="margin-top:20px;text-align:center">
          <button class="btn btn-ghost btn-sm" id="back-to-store" style="color:rgba(255,255,255,.4);font-size:.8rem">
            ← Voltar à loja
          </button>
        </p>
      </div>
    </div>
  `;

  container.querySelector('#back-to-store').addEventListener('click', () => {
    document.body.style.padding = '';
    navigate('/');
  });

  container.querySelector('#login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const email = container.querySelector('#admin-email').value.trim();
    const pass = container.querySelector('#admin-pass').value;
    const btn = container.querySelector('#login-btn');
    const errEl = container.querySelector('#login-error');

    errEl.style.display = 'none';
    btn.disabled = true;
    btn.innerHTML = '<span class="loader-ring" style="width:18px;height:18px;border-width:2px"></span>';

    const { data, error } = await signInAdmin(email, pass);

    if (error || !data.session) {
      errEl.textContent = 'Email ou senha incorretos. Verifique e tente novamente.';
      errEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Entrar no Painel';
      return;
    }

    const { getProfile, signOutAdmin } = await import('../../supabase.js');
    const profile = await getProfile();

    if (profile?.role !== 'admin') {
      await signOutAdmin();
      errEl.textContent = 'Acesso negado: Sua conta não possui privilégios de administrador.';
      errEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Entrar no Painel';
      return;
    }

    document.body.style.padding = '';
    navigate('/admin/dashboard');
  });
}
