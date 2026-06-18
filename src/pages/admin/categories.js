import { supabase } from '../../supabase.js';

export async function renderCategoriesAdmin(container) {
  let sortCol = 'ordem';
  let sortAsc = true;

  async function loadData() {
    container.innerHTML = `<div style="padding:40px;text-align:center;">Carregando categorias...</div>`;
    
    let query = supabase.from('categorias').select('*').order(sortCol, { ascending: sortAsc });
    const { data, error } = await query;
    if (error) {
      container.innerHTML = `<div style="padding:20px;color:red;">Erro ao carregar categorias: ${error.message}</div>`;
      return;
    }
    
    renderUI(data);
  }

  function renderUI(categorias) {
    const html = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
        <h2 style="font-size:1.5rem;font-weight:600;">Gerenciar Categorias</h2>
        <button id="btn-add-category" class="btn btn-primary" style="padding:10px 20px;">
          + Nova Categoria
        </button>
      </div>

      <div style="background:var(--white);border-radius:var(--radius-md);box-shadow:var(--shadow-sm);overflow:hidden;">
        <table style="width:100%;border-collapse:collapse;text-align:left;">
          <thead>
            <tr style="background:var(--gray-50);border-bottom:1px solid var(--gray-200);">
              <th style="padding:16px;font-weight:600;color:var(--gray-600);">Nome</th>
              <th style="padding:16px;font-weight:600;color:var(--gray-600);">Ordem</th>
              <th style="padding:16px;font-weight:600;color:var(--gray-600);text-align:right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${categorias.length === 0 ? `<tr><td colspan="3" style="padding:32px;text-align:center;color:var(--gray-500);">Nenhuma categoria cadastrada.</td></tr>` : ''}
            ${categorias.map(cat => `
              <tr style="border-bottom:1px solid var(--gray-100);">
                <td style="padding:16px;font-weight:500;">${cat.nome}</td>
                <td style="padding:16px;color:var(--gray-500);">${cat.ordem}</td>
                <td style="padding:16px;text-align:right;">
                  <button class="btn-edit-category" data-id="${cat.id}" data-nome="${cat.nome}" data-ordem="${cat.ordem}" style="background:none;border:none;color:var(--gold);cursor:pointer;font-weight:500;margin-right:12px;">Editar</button>
                  <button class="btn-del-category" data-id="${cat.id}" style="background:none;border:none;color:var(--error);cursor:pointer;font-weight:500;">Excluir</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Modal Category -->
      <div id="modal-category" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;align-items:center;justify-content:center;">
        <div style="background:var(--white);width:100%;max-width:400px;border-radius:var(--radius-lg);padding:32px;box-shadow:var(--shadow-xl);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;">
            <h3 id="modal-category-title" style="font-size:1.25rem;font-weight:600;">Nova Categoria</h3>
            <button id="modal-category-close" style="background:none;border:none;font-size:1.5rem;cursor:pointer;">&times;</button>
          </div>
          <form id="form-category" style="display:flex;flex-direction:column;gap:16px;">
            <input type="hidden" id="cat-id" />
            <div class="form-group">
              <label class="form-label">Nome da Categoria *</label>
              <input type="text" id="cat-nome" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">Ordem de Exibição</label>
              <input type="number" id="cat-ordem" class="form-input" value="0" />
            </div>
            <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:16px;">
              <button type="button" id="btn-cancel-cat" class="btn btn-ghost">Cancelar</button>
              <button type="submit" class="btn btn-primary" id="btn-save-cat">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    `;

    container.innerHTML = html;

    const modal = document.getElementById('modal-category');
    const form = document.getElementById('form-category');
    const inputId = document.getElementById('cat-id');
    const inputNome = document.getElementById('cat-nome');
    const inputOrdem = document.getElementById('cat-ordem');
    const btnSave = document.getElementById('btn-save-cat');

    function openModal(id='', nome='', ordem='0') {
      inputId.value = id;
      inputNome.value = nome;
      inputOrdem.value = ordem;
      document.getElementById('modal-category-title').textContent = id ? 'Editar Categoria' : 'Nova Categoria';
      modal.style.display = 'flex';
      inputNome.focus();
    }

    function closeModal() {
      modal.style.display = 'none';
      form.reset();
    }

    document.getElementById('btn-add-category').addEventListener('click', () => openModal());
    document.getElementById('modal-category-close').addEventListener('click', closeModal);
    document.getElementById('btn-cancel-cat').addEventListener('click', closeModal);

    container.querySelectorAll('.btn-edit-category').forEach(btn => {
      btn.addEventListener('click', (e) => {
        openModal(e.target.dataset.id, e.target.dataset.nome, e.target.dataset.ordem);
      });
    });

    container.querySelectorAll('.btn-del-category').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if(confirm('Tem certeza que deseja excluir esta categoria? Os produtos vinculados a ela ficarão sem categoria.')) {
          const { error } = await supabase.from('categorias').delete().eq('id', e.target.dataset.id);
          if(error) alert('Erro ao excluir: ' + error.message);
          else loadData();
        }
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      btnSave.disabled = true;
      btnSave.textContent = 'Salvando...';

      const payload = {
        nome: inputNome.value.trim(),
        ordem: parseInt(inputOrdem.value) || 0
      };

      if (inputId.value) {
        // Edit
        const { error } = await supabase.from('categorias').update(payload).eq('id', inputId.value);
        if(error) alert('Erro ao atualizar: ' + error.message);
      } else {
        // Create
        const { error } = await supabase.from('categorias').insert(payload);
        if(error) alert('Erro ao criar: ' + error.message);
      }

      closeModal();
      loadData();
    });
  }

  await loadData();
}
