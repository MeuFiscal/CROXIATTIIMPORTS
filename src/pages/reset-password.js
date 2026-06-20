import { supabase } from '../supabase.js';
import { navigate } from '../router.js';
import { showToast } from '../components/toast.js';

export async function renderResetPassword(container) {
  container.innerHTML = '';
  container.className = 'page-enter';

  const page = document.createElement('div');
  page.className = 'login-page container';
  page.style.maxWidth = '460px';
  page.style.margin = '40px auto';
  page.style.padding = '0 16px';

  page.innerHTML = `
    <div class="auth-card" style="background: var(--white); padding: 32px 24px; border-radius: var(--radius-xl); box-shadow: var(--shadow-md); text-align: center;">
      <h1 style="font-family: var(--font-serif); font-size: 1.8rem; color: var(--gold); margin-bottom: 8px;">Redefinir Senha</h1>
      <p style="color: var(--gray-500); font-size: 0.95rem; margin-bottom: 24px;" id="auth-subtitle">Digite sua nova senha abaixo</p>
      
      <form id="reset-password-form" style="display: flex; flex-direction: column; gap: 16px;">
        <div class="form-group" style="text-align: left;">
          <label style="display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 6px; color: var(--gray-700);">Nova Senha</label>
          <div style="position: relative;">
            <input type="password" id="new-password" required minlength="6" style="width: 100%; padding: 12px 40px 12px 16px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-md); font-size: 1rem; transition: border-color 0.2s;" />
            <button type="button" class="toggle-pwd-btn" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--gray-400); display: flex; align-items: center; justify-content: center; padding: 4px;">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
          </div>
        </div>
        
        <div class="form-group" style="text-align: left;">
          <label style="display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 6px; color: var(--gray-700);">Confirmar Nova Senha</label>
          <div style="position: relative;">
            <input type="password" id="new-password-confirm" required minlength="6" style="width: 100%; padding: 12px 40px 12px 16px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-md); font-size: 1rem; transition: border-color 0.2s;" />
            <button type="button" class="toggle-pwd-btn" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--gray-400); display: flex; align-items: center; justify-content: center; padding: 4px;">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
          </div>
        </div>
        
        <button type="submit" id="btn-reset-submit" class="btn btn-primary btn-lg" style="margin-top: 8px; font-weight: 600; letter-spacing: 0.05em;">SALVAR NOVA SENHA</button>
      </form>
    </div>
  `;

  container.appendChild(page);

  // Toggle password visibility
  page.querySelectorAll('.toggle-pwd-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
      } else {
        input.type = 'password';
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
      }
    });
  });

  const form = page.querySelector('#reset-password-form');
  const btnSubmit = page.querySelector('#btn-reset-submit');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = page.querySelector('#new-password').value;
    const newPasswordConfirm = page.querySelector('#new-password-confirm').value;

    if (newPassword !== newPasswordConfirm) {
      showToast('As senhas não coincidem', 'error');
      return;
    }

    btnSubmit.disabled = true;
    btnSubmit.textContent = 'SALVANDO...';

    // Extrai token_hash da URL caso o usuário esteja usando um template de email customizado
    // para burlar os bloqueios de antivírus do Outlook.
    const urlObj = new URL(window.location.href.replace('#/', ''));
    const tokenHash = urlObj.searchParams.get('token_hash');

    try {
      if (tokenHash) {
        // Se temos o token_hash, precisamos primeiro verificar a OTP para "logar" o usuário
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery'
        });
        
        if (verifyError) throw verifyError;
      }

      // Agora que o usuário está "logado" pela recuperação, atualizamos a senha
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      showToast('Senha redefinida com sucesso!', 'success');
      setTimeout(() => {
        window.location.hash = '/account';
        window.location.reload();
      }, 1500);

    } catch (err) {
      console.error(err);
      showToast('Erro ao redefinir senha. O link pode ter expirado.', 'error');
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'SALVAR NOVA SENHA';
    }
  });
}
