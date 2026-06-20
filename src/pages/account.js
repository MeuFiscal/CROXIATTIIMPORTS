import { getCustomerSession, getProfile, updateProfile, signOutCustomer, resetPassword } from '../supabase.js';
import { navigate } from '../router.js';
import { showToast } from '../components/toast.js';

export async function renderAccount(container) {
  const session = await getCustomerSession();
  
  if (!session) {
    navigate('/login');
    return;
  }

  container.innerHTML = `
    <div class="container" style="padding-top: 48px; text-align: center;">
      <div class="loader" style="margin: 0 auto; border: 3px solid var(--gray-200); border-top-color: var(--gold); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>
      <p style="margin-top: 16px; color: var(--gray-500);">Carregando perfil...</p>
    </div>
    <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
  `;

  const profile = await getProfile();

  if (!profile) {
    showToast('Erro ao carregar perfil', 'error');
    navigate('/');
    return;
  }

  container.innerHTML = '';
  container.className = 'page-enter';

  const page = document.createElement('div');
  page.className = 'account-page container';
  page.style.maxWidth = '600px';
  page.style.margin = '40px auto';
  page.style.padding = '0 16px';

  page.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
      <h1 style="font-family: var(--font-serif); font-size: 1.8rem; color: var(--black);">Minha Conta</h1>
      <button id="btn-logout" class="btn btn-outline" style="border-color: var(--error); color: var(--error); padding: 8px 16px;">Sair</button>
    </div>

    <div class="auth-card" style="background: var(--white); padding: 32px 24px; border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); border: 1px solid var(--gray-200);">
      
      <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid var(--gray-100);">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--gold-pale); color: var(--gold-dark); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 2rem;">
          ${profile.nome ? profile.nome.charAt(0).toUpperCase() : '👤'}
        </div>
        <div>
          <h2 style="font-size: 1.2rem; margin-bottom: 4px;">${profile.nome || 'Cliente'}</h2>
          <p style="color: var(--gray-500); font-size: 0.9rem;">${session.user.email}</p>
        </div>
      </div>

      <h3 style="font-size: 1.05rem; margin-bottom: 16px; color: var(--gray-800);">Dados Pessoais</h3>
      <form id="profile-form" style="display: flex; flex-direction: column; gap: 16px;">
        <div class="form-group" style="text-align: left;">
          <label style="display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 6px; color: var(--gray-700);">Nome Completo</label>
          <input type="text" id="prof-nome" value="${profile.nome || ''}" required style="width: 100%; padding: 12px 16px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-md); font-size: 1rem;" />
        </div>
        
        <div style="display: flex; gap: 16px; flex-wrap: wrap;">
          <div class="form-group" style="flex: 1; min-width: 200px; text-align: left;">
            <label style="display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 6px; color: var(--gray-700);">WhatsApp</label>
            <input type="tel" id="prof-whatsapp" value="${profile.whatsapp || ''}" style="width: 100%; padding: 12px 16px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-md); font-size: 1rem;" />
          </div>
          <div class="form-group" style="flex: 1; min-width: 200px; text-align: left;">
            <label style="display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 6px; color: var(--gray-700);">Telefone Fixo (opcional)</label>
            <input type="tel" id="prof-telefone" value="${profile.telefone || ''}" style="width: 100%; padding: 12px 16px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-md); font-size: 1rem;" />
          </div>
        </div>

        <button type="submit" id="btn-save-profile" class="btn btn-primary" style="margin-top: 12px; align-self: flex-start;">SALVAR ALTERAÇÕES</button>
      </form>
    </div>

    <div style="margin-top: 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
      <div style="background: var(--white); padding: 20px; border-radius: var(--radius-lg); border: 1px solid var(--gray-200); box-shadow: var(--shadow-sm); display: flex; flex-direction: column; align-items: flex-start; gap: 12px;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(200,155,60,0.1); color: var(--gold); display: flex; align-items: center; justify-content: center;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </div>
        <h3 style="font-size: 1.05rem;">Meus Pedidos</h3>
        <p style="font-size: 0.85rem; color: var(--gray-500); line-height: 1.4;">Acompanhe o status das suas compras e encomendas.</p>
        <button onclick="window.location.hash='/my-orders'" class="btn btn-outline" style="margin-top: auto; width: 100%;">Ver Pedidos</button>
      </div>

      <div style="background: var(--white); padding: 20px; border-radius: var(--radius-lg); border: 1px solid var(--gray-200); box-shadow: var(--shadow-sm); display: flex; flex-direction: column; align-items: flex-start; gap: 12px;">
        <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(200,155,60,0.1); color: var(--gold); display: flex; align-items: center; justify-content: center;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
        <h3 style="font-size: 1.05rem;">Segurança</h3>
        <p style="font-size: 0.85rem; color: var(--gray-500); line-height: 1.4;">Deseja alterar sua senha atual?</p>
        <div style="width: 100%; margin-top: 8px;">
          <input type="password" id="prof-new-pwd" placeholder="Nova senha (min. 6 char)" style="width: 100%; padding: 10px 12px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-md); font-size: 0.9rem; margin-bottom: 8px;" />
          <button id="btn-update-pwd" class="btn btn-outline" style="width: 100%;">Atualizar Senha</button>
        </div>
      </div>
    </div>
  `;

  container.appendChild(page);

  // Handlers
  const logoutBtn = page.querySelector('#btn-logout');
  logoutBtn.addEventListener('click', async () => {
    logoutBtn.textContent = 'Saindo...';
    await signOutCustomer();
    window.location.reload();
  });

  const form = page.querySelector('#profile-form');
  const btnSave = page.querySelector('#btn-save-profile');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    btnSave.disabled = true;
    btnSave.textContent = 'SALVANDO...';

    const updates = {
      nome: page.querySelector('#prof-nome').value,
      whatsapp: page.querySelector('#prof-whatsapp').value,
      telefone: page.querySelector('#prof-telefone').value
    };

    const { error } = await updateProfile(updates);

    btnSave.disabled = false;
    btnSave.textContent = 'SALVAR ALTERAÇÕES';

    if (error) {
      showToast('Erro ao atualizar perfil', 'error');
    } else {
      showToast('Perfil atualizado com sucesso!', 'success');
    }
  });

  const btnUpdatePwd = page.querySelector('#btn-update-pwd');
  btnUpdatePwd.addEventListener('click', async () => {
    const pwdInput = page.querySelector('#prof-new-pwd');
    const newPassword = pwdInput.value;

    if (newPassword.length < 6) {
      showToast('A senha deve ter no mínimo 6 caracteres', 'error');
      return;
    }

    btnUpdatePwd.disabled = true;
    btnUpdatePwd.textContent = 'ATUALIZANDO...';
    
    // Using supabase auth to update user directly
    const { supabase } = await import('../supabase.js');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    btnUpdatePwd.textContent = 'Atualizar Senha';
    btnUpdatePwd.disabled = false;

    if (error) {
      showToast(error.message || 'Erro ao atualizar senha', 'error');
    } else {
      pwdInput.value = '';
      showToast('Senha atualizada com sucesso!', 'success');
    }
  });
}
