import { getCustomerSession, signInCustomer, signUpCustomer } from '../supabase.js';
import { navigate } from '../router.js';
import { showToast } from '../components/toast.js';

export async function renderLogin(container) {
  // Se já logado, redireciona para a home
  const session = await getCustomerSession();
  if (session) {
    navigate('/');
    return;
  }

  container.innerHTML = '';
  container.className = 'page-enter';

  const page = document.createElement('div');
  page.className = 'login-page container';
  page.style.maxWidth = '460px';
  page.style.margin = '40px auto';
  page.style.padding = '0 16px';

  page.innerHTML = `
    <div class="auth-card" style="background: var(--white); padding: 32px 24px; border-radius: var(--radius-xl); box-shadow: var(--shadow-md); text-align: center;">
      <h1 style="font-family: var(--font-serif); font-size: 1.8rem; color: var(--gold); margin-bottom: 8px;">Bem-vindo(a)</h1>
      <p style="color: var(--gray-500); font-size: 0.95rem; margin-bottom: 24px;" id="auth-subtitle">Faça login para acessar sua conta</p>
      
      <!-- LOGIN FORM -->
      <form id="login-form" style="display: flex; flex-direction: column; gap: 16px;">
        <div class="form-group" style="text-align: left;">
          <label style="display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 6px; color: var(--gray-700);">E-mail</label>
          <input type="email" id="login-email" required style="width: 100%; padding: 12px 16px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-md); font-size: 1rem; transition: border-color 0.2s;" />
        </div>
        <div class="form-group" style="text-align: left;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <label style="font-size: 0.85rem; font-weight: 500; color: var(--gray-700);">Senha</label>
            <a href="#" id="toggle-recover" style="font-size: 0.75rem; color: var(--gold); text-decoration: none;">Esqueceu a senha?</a>
          </div>
          <div style="position: relative;">
            <input type="password" id="login-password" required style="width: 100%; padding: 12px 40px 12px 16px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-md); font-size: 1rem; transition: border-color 0.2s;" />
            <button type="button" class="toggle-pwd-btn" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--gray-400); display: flex; align-items: center; justify-content: center; padding: 4px;">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
          </div>
        </div>
        <button type="submit" id="btn-login-submit" class="btn btn-primary btn-lg" style="margin-top: 8px; font-weight: 600; letter-spacing: 0.05em;">ENTRAR</button>
        <div style="margin-top: 16px; font-size: 0.9rem; color: var(--gray-500);">
          Não tem uma conta? <a href="#" id="toggle-register" style="color: var(--gold); font-weight: 600; text-decoration: none;">Cadastre-se</a>
        </div>
      </form>

      <!-- RECOVER PASSWORD FORM (Hidden by default) -->
      <form id="recover-form" style="display: none; flex-direction: column; gap: 16px;">
        <p style="font-size: 0.9rem; color: var(--gray-600); margin-bottom: 8px;">Enviaremos um e-mail com as instruções para você redefinir sua senha.</p>
        <div class="form-group" style="text-align: left;">
          <label style="display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 6px; color: var(--gray-700);">E-mail</label>
          <input type="email" id="recover-email" required style="width: 100%; padding: 12px 16px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-md); font-size: 1rem;" />
        </div>
        <button type="submit" id="btn-recover-submit" class="btn btn-primary btn-lg" style="margin-top: 8px; font-weight: 600; letter-spacing: 0.05em;">RECUPERAR SENHA</button>
        <div style="margin-top: 16px; font-size: 0.9rem; color: var(--gray-500);">
          Lembrou a senha? <a href="#" id="toggle-login-from-recover" style="color: var(--gold); font-weight: 600; text-decoration: none;">Fazer Login</a>
        </div>
      </form>

      <!-- REGISTER FORM (Hidden by default) -->
      <form id="register-form" style="display: none; flex-direction: column; gap: 16px;">
        <div class="form-group" style="text-align: left;">
          <label style="display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 6px; color: var(--gray-700);">Nome Completo</label>
          <input type="text" id="reg-nome" required style="width: 100%; padding: 12px 16px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-md); font-size: 1rem;" />
        </div>
        <div class="form-group" style="text-align: left;">
          <label style="display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 6px; color: var(--gray-700);">E-mail</label>
          <input type="email" id="reg-email" required style="width: 100%; padding: 12px 16px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-md); font-size: 1rem;" />
        </div>
        <div class="form-group" style="text-align: left;">
          <label style="display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 6px; color: var(--gray-700);">Telefone</label>
          <input type="tel" id="reg-telefone" placeholder="(00) 0000-0000" style="width: 100%; padding: 12px 16px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-md); font-size: 1rem;" />
        </div>
        <div class="form-group" style="text-align: left;">
          <label style="display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 6px; color: var(--gray-700);">WhatsApp</label>
          <input type="tel" id="reg-whatsapp" required placeholder="(00) 00000-0000" style="width: 100%; padding: 12px 16px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-md); font-size: 1rem;" />
        </div>
        <div class="form-group" style="text-align: left;">
          <label style="display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 6px; color: var(--gray-700);">Senha</label>
          <div style="position: relative;">
            <input type="password" id="reg-password" required minlength="6" style="width: 100%; padding: 12px 40px 12px 16px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-md); font-size: 1rem;" />
            <button type="button" class="toggle-pwd-btn" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--gray-400); display: flex; align-items: center; justify-content: center; padding: 4px;">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
          </div>
        </div>
        <div class="form-group" style="text-align: left;">
          <label style="display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 6px; color: var(--gray-700);">Confirmar Senha</label>
          <div style="position: relative;">
            <input type="password" id="reg-password-confirm" required minlength="6" style="width: 100%; padding: 12px 40px 12px 16px; border: 1.5px solid var(--gray-200); border-radius: var(--radius-md); font-size: 1rem;" />
            <button type="button" class="toggle-pwd-btn" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--gray-400); display: flex; align-items: center; justify-content: center; padding: 4px;">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
          </div>
        </div>
        <button type="submit" id="btn-reg-submit" class="btn btn-primary btn-lg" style="margin-top: 8px; font-weight: 600; letter-spacing: 0.05em;">CRIAR CONTA</button>
        <div style="margin-top: 16px; font-size: 0.9rem; color: var(--gray-500);">
          Já tem uma conta? <a href="#" id="toggle-login" style="color: var(--gold); font-weight: 600; text-decoration: none;">Fazer Login</a>
        </div>
      </form>
    </div>
  `;

  container.appendChild(page);

  const loginForm = page.querySelector('#login-form');
  const registerForm = page.querySelector('#register-form');
  const recoverForm = page.querySelector('#recover-form');
  const subtitle = page.querySelector('#auth-subtitle');
  
  const toggleRegisterBtn = page.querySelector('#toggle-register');
  const toggleLoginBtn = page.querySelector('#toggle-login');
  const toggleRecoverBtn = page.querySelector('#toggle-recover');
  const toggleLoginFromRecoverBtn = page.querySelector('#toggle-login-from-recover');
  
  const btnLoginSubmit = page.querySelector('#btn-login-submit');
  const btnRegSubmit = page.querySelector('#btn-reg-submit');
  const btnRecoverSubmit = page.querySelector('#btn-recover-submit');

  // Toggle Forms
  toggleRegisterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    recoverForm.style.display = 'none';
    registerForm.style.display = 'flex';
    subtitle.textContent = 'Crie sua conta para uma experiência premium';
  });

  toggleLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    recoverForm.style.display = 'none';
    loginForm.style.display = 'flex';
    subtitle.textContent = 'Faça login para acessar sua conta';
  });

  toggleRecoverBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    recoverForm.style.display = 'flex';
    subtitle.textContent = 'Recuperar Senha';
  });

  toggleLoginFromRecoverBtn.addEventListener('click', (e) => {
    e.preventDefault();
    recoverForm.style.display = 'none';
    registerForm.style.display = 'none';
    loginForm.style.display = 'flex';
    subtitle.textContent = 'Faça login para acessar sua conta';
  });

  // Check URL params to open specific tab
  if (window.location.hash.includes('tab=register')) {
    loginForm.style.display = 'none';
    recoverForm.style.display = 'none';
    registerForm.style.display = 'flex';
    subtitle.textContent = 'Crie sua conta para uma experiência premium';
  }

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

  // Login Submit
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = page.querySelector('#login-email').value;
    const password = page.querySelector('#login-password').value;

    btnLoginSubmit.disabled = true;
    btnLoginSubmit.textContent = 'ENTRANDO...';

    const { error } = await signInCustomer(email, password);

    if (error) {
      showToast('E-mail ou senha inválidos', 'error');
      btnLoginSubmit.disabled = false;
      btnLoginSubmit.textContent = 'ENTRAR';
    } else {
      showToast('Login realizado com sucesso!', 'success');
      // Redireciona para a home
      setTimeout(() => {
        window.location.hash = '/';
        window.location.reload(); // Para atualizar header/drawer
      }, 500);
    }
  });

  // Register Submit
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = page.querySelector('#reg-email').value;
    const password = page.querySelector('#reg-password').value;
    const passwordConfirm = page.querySelector('#reg-password-confirm').value;
    const nome = page.querySelector('#reg-nome').value;
    const whatsapp = page.querySelector('#reg-whatsapp').value;
    const telefone = page.querySelector('#reg-telefone').value;

    if (password !== passwordConfirm) {
      showToast('As senhas não coincidem', 'error');
      return;
    }

    btnRegSubmit.disabled = true;
    btnRegSubmit.textContent = 'CRIANDO CONTA...';

    const metadata = { nome, whatsapp, telefone };
    const { error } = await signUpCustomer(email, password, metadata);

    if (error) {
      showToast(error.message, 'error');
      btnRegSubmit.disabled = false;
      btnRegSubmit.textContent = 'CRIAR CONTA';
    } else {
      showToast('Conta criada com sucesso!', 'success');
      setTimeout(() => {
        window.location.hash = '/';
        window.location.reload();
      }, 500);
    }
  });

  // Recover Password Submit
  recoverForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = page.querySelector('#recover-email').value;
    
    btnRecoverSubmit.disabled = true;
    btnRecoverSubmit.textContent = 'ENVIANDO...';

    // We must import resetPassword from supabase.js at the top!
    const { resetPassword } = await import('../supabase.js');
    const { error } = await resetPassword(email);

    if (error) {
      showToast('Erro ao enviar e-mail de recuperação', 'error');
      btnRecoverSubmit.disabled = false;
      btnRecoverSubmit.textContent = 'RECUPERAR SENHA';
    } else {
      showToast('E-mail de recuperação enviado com sucesso!', 'success');
      // Back to login
      setTimeout(() => {
        toggleLoginFromRecoverBtn.click();
        btnRecoverSubmit.disabled = false;
        btnRecoverSubmit.textContent = 'RECUPERAR SENHA';
      }, 1500);
    }
  });
}
