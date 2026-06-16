// ======================================================
// ADMIN PRODUCTS PAGE — CRUD completo com upload/crop
// ======================================================
import { supabase } from '../../supabase.js';
import { requireAdmin, renderAdminLayout } from './layout.js';
import { formatCurrency } from '../../components/productCard.js';
import { showToast } from '../../components/toast.js';
import { confirmModal, openModal } from '../../components/modal.js';

export async function renderAdminProducts(container) {
  if (!await requireAdmin()) return;

  return renderAdminLayout(container, 'Produtos', async (content) => {
    content.innerHTML = `
      <div style="margin-bottom:20px;display:flex;justify-content:flex-end">
        <button class="btn btn-primary" id="new-product-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Novo Produto
        </button>
      </div>
      <div class="admin-table-wrap">
        <div class="admin-table-header">
          <input type="search" class="form-input" id="prod-search" placeholder="Buscar produto..." style="max-width:280px;padding:8px 14px;font-size:.85rem" />
          <span id="prod-count" class="text-sm text-muted"></span>
        </div>
        <div id="products-table-wrap"></div>
      </div>
    `;

    content.querySelector('#new-product-btn').addEventListener('click', () => openProductForm(null, loadProducts));

    let searchQ = '';
    let debounce;
    content.querySelector('#prod-search').addEventListener('input', e => {
      searchQ = e.target.value;
      clearTimeout(debounce);
      debounce = setTimeout(() => loadProducts(searchQ), 300);
    });

    const loadProducts = async (q = '') => {
      const wrap = content.querySelector('#products-table-wrap');
      wrap.innerHTML = '<div style="padding:32px;text-align:center;color:var(--gray-400)">Carregando...</div>';

      let query = supabase.from('produtos').select('*', { count: 'exact' }).order('created_at', { ascending: false });
      if (q) query = query.ilike('nome', `%${q}%`);

      const { data, count } = await query;
      const countEl = content.querySelector('#prod-count');
      if (countEl) countEl.textContent = `${count || 0} produto${count !== 1 ? 's' : ''}`;

      if (!data || !data.length) {
        wrap.innerHTML = '<div class="admin-table-empty">Nenhum produto cadastrado</div>';
        return;
      }

      wrap.innerHTML = `
        <div style="overflow-x:auto">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Imagem</th><th>Nome</th><th>Marca</th>
                <th>Preço</th><th>Estoque</th><th>Destaque</th><th>Encomenda</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(p => `
                <tr data-id="${p.id}">
                  <td>
                    ${p.imagem_url
                      ? `<img class="td-thumb" src="${p.imagem_url}" alt="${p.nome}" loading="lazy" />`
                      : `<div class="td-img-placeholder">✦</div>`}
                  </td>
                  <td><div style="font-weight:500;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.nome}</div></td>
                  <td><span class="text-sm text-muted">${p.marca || '—'}</span></td>
                  <td><strong>${formatCurrency(p.preco)}</strong></td>
                  <td>
                    <span class="badge ${p.quantidade <= 0 ? 'badge-error' : p.quantidade <= 5 ? 'badge-warning' : 'badge-success'}">
                      ${p.quantidade} un.
                    </span>
                  </td>
                  <td>${p.destaque ? '<span class="badge badge-gold">★ Sim</span>' : '<span class="text-muted text-sm">Não</span>'}</td>
                  <td>${p.apenas_encomenda ? '<span class="badge badge-encomenda">Sim</span>' : '<span class="text-muted text-sm">Não</span>'}</td>
                  <td>
                    <div style="display:flex;gap:6px">
                      <button class="btn btn-sm btn-outline edit-btn" data-id="${p.id}">Editar</button>
                      <button class="btn btn-sm btn-ghost del-btn" data-id="${p.id}" style="color:var(--error)">Excluir</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      wrap.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const prod = data.find(p => p.id === btn.dataset.id);
          openProductForm(prod, () => loadProducts(searchQ));
        });
      });

      wrap.querySelectorAll('.del-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const ok = await confirmModal({ title: 'Excluir Produto', message: 'Esta ação não pode ser desfeita. Deseja excluir este produto?', confirmText: 'Excluir', danger: true });
          if (!ok) return;
          const { error } = await supabase.from('produtos').delete().eq('id', btn.dataset.id);
          if (error) { showToast('Erro ao excluir produto', 'error'); return; }
          showToast('Produto excluído', 'success');
          loadProducts(searchQ);
        });
      });
    };

    loadProducts();
  });
}

// ---- Product Form Modal ----
function openProductForm(produto, onSave) {
  const isEdit = !!produto;
  let croppedBlob = null;
  let previewUrl = produto?.imagem_url || null;

  const body = `
    <form id="prod-form" novalidate style="display:flex;flex-direction:column;gap:16px">
      <!-- Image Upload -->
      <div class="form-group">
        <label class="form-label">Imagem do Produto</label>
        <div id="img-preview-wrap" style="margin-bottom:10px;${previewUrl ? '' : 'display:none'}">
          <div class="product-img-preview">
            <img id="current-preview" src="${previewUrl || ''}" style="width:120px;height:120px;object-fit:cover;border-radius:12px" />
            <button type="button" class="img-remove-btn" id="remove-img-btn">✕</button>
          </div>
        </div>
        <div class="upload-area" id="upload-area" ${previewUrl ? 'style="display:none"' : ''}>
          <div class="icon">📷</div>
          <p><strong>Clique para enviar</strong> ou arraste aqui</p>
          <p style="font-size:.78rem;margin-top:4px;color:var(--gray-400)">JPG, PNG, WEBP • Máx. 10MB</p>
          <input type="file" id="img-file-input" accept="image/*" style="display:none" />
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
        <div class="form-group" style="grid-column:1/-1">
          <label class="form-label" for="p-nome">Nome *</label>
          <input class="form-input" type="text" id="p-nome" value="${produto?.nome || ''}" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="p-marca">Marca</label>
          <input class="form-input" type="text" id="p-marca" value="${produto?.marca || ''}" />
        </div>
        <div class="form-group">
          <label class="form-label" for="p-preco">Preço *</label>
          <input class="form-input" type="number" id="p-preco" value="${produto?.preco || ''}" min="0" step="0.01" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="p-qty">Quantidade</label>
          <input class="form-input" type="number" id="p-qty" value="${produto?.quantidade ?? 0}" min="0" />
        </div>
        <div class="form-group" style="grid-column:1/-1">
          <label class="form-label" for="p-desc">Descrição</label>
          <textarea class="form-input" id="p-desc" rows="3">${produto?.descricao || ''}</textarea>
        </div>
      </div>

      <div style="display:flex;gap:20px;flex-wrap:wrap">
        <label class="toggle">
          <input type="checkbox" id="p-destaque" ${produto?.destaque ? 'checked' : ''} />
          <div class="track"></div>
          <span style="font-size:.88rem">Produto em Destaque</span>
        </label>
        <label class="toggle">
          <input type="checkbox" id="p-encomenda" ${produto?.apenas_encomenda ? 'checked' : ''} />
          <div class="track"></div>
          <span style="font-size:.88rem">Somente por Encomenda</span>
        </label>
      </div>

      <div id="prod-form-error" style="display:none" class="login-error" style="background:rgba(185,64,64,.1);border:1px solid rgba(185,64,64,.3);color:var(--error);padding:10px 14px;border-radius:8px;font-size:.85rem"></div>
    </form>
  `;

  const footer = `
    <button class="btn btn-ghost" id="prod-cancel">Cancelar</button>
    <button class="btn btn-primary" id="prod-save">
      ${isEdit ? 'Salvar Alterações' : 'Cadastrar Produto'}
    </button>
  `;

  const { close } = openModal({
    title: isEdit ? 'Editar Produto' : 'Novo Produto',
    body, footer, maxWidth: '600px'
  });

  document.getElementById('prod-cancel').addEventListener('click', close);

  // Upload area
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('img-file-input');
  const previewWrap = document.getElementById('img-preview-wrap');
  const currentPreview = document.getElementById('current-preview');

  uploadArea.addEventListener('click', () => fileInput.click());
  uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
  uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
  uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) processImageFile(file);
  });
  fileInput.addEventListener('change', e => { if (e.target.files[0]) processImageFile(e.target.files[0]); });
  document.getElementById('remove-img-btn').addEventListener('click', () => {
    previewUrl = null; croppedBlob = null;
    previewWrap.style.display = 'none';
    uploadArea.style.display = '';
    currentPreview.src = '';
  });

  function processImageFile(file) {
    const reader = new FileReader();
    reader.onload = async e => {
      const src = e.target.result;
      // Show inline crop UI
      await showCropModal(src, (blob, url) => {
        croppedBlob = blob;
        previewUrl = url;
        currentPreview.src = url;
        previewWrap.style.display = '';
        uploadArea.style.display = 'none';
      });
    };
    reader.readAsDataURL(file);
  }

  // Save
  document.getElementById('prod-save').addEventListener('click', async () => {
    const nome = document.getElementById('p-nome').value.trim();
    const preco = parseFloat(document.getElementById('p-preco').value);
    const errEl = document.getElementById('prod-form-error');

    if (!nome || isNaN(preco) || preco < 0) {
      errEl.textContent = 'Preencha nome e preço corretamente.';
      errEl.style.display = 'block';
      return;
    }
    errEl.style.display = 'none';

    const saveBtn = document.getElementById('prod-save');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="loader-ring" style="width:16px;height:16px;border-width:2px"></span>';

    let imgUrl = produto?.imagem_url || null;

    // Upload image if changed
    if (croppedBlob) {
      const fileName = `produto_${Date.now()}.webp`;
      const { data: upData, error: upErr } = await supabase.storage
        .from('produtos')
        .upload(fileName, croppedBlob, { contentType: 'image/webp', upsert: false });
      if (upErr) {
        showToast('Erro no upload da imagem: ' + upErr.message, 'error');
        saveBtn.disabled = false;
        saveBtn.textContent = isEdit ? 'Salvar Alterações' : 'Cadastrar Produto';
        return;
      }
      const { data: urlData } = supabase.storage.from('produtos').getPublicUrl(upData.path);
      imgUrl = urlData.publicUrl;
    } else if (!previewUrl) {
      imgUrl = null;
    }

    const payload = {
      nome,
      marca: document.getElementById('p-marca').value.trim() || null,
      preco,
      quantidade: parseInt(document.getElementById('p-qty').value) || 0,
      descricao: document.getElementById('p-desc').value.trim() || null,
      destaque: document.getElementById('p-destaque').checked,
      apenas_encomenda: document.getElementById('p-encomenda').checked,
      imagem_url: imgUrl,
      updated_at: new Date().toISOString()
    };

    let error;
    if (isEdit) {
      ({ error } = await supabase.from('produtos').update(payload).eq('id', produto.id));
    } else {
      ({ error } = await supabase.from('produtos').insert(payload));
    }

    if (error) {
      showToast('Erro ao salvar: ' + error.message, 'error');
      saveBtn.disabled = false;
      saveBtn.textContent = isEdit ? 'Salvar Alterações' : 'Cadastrar Produto';
      return;
    }

    showToast(isEdit ? 'Produto atualizado!' : 'Produto cadastrado!', 'success');
    close();
    onSave();
  });
}

async function showCropModal(src, onCrop) {
  return new Promise(resolve => {
    const { close } = openModal({
      title: 'Ajustar Imagem',
      body: `
        <div style="text-align:center;padding:8px 0">
          <div id="crop-container" style="max-height:340px;overflow:hidden;background:#111;border-radius:8px">
            <img id="crop-img" src="${src}" style="max-width:100%;display:block;margin:0 auto" />
          </div>
          <p style="font-size:.8rem;color:var(--gray-500);margin-top:10px">Arraste para reposicionar • Scroll para zoom</p>
        </div>
      `,
      footer: `
        <button class="btn btn-ghost" id="crop-cancel">Cancelar</button>
        <button class="btn btn-primary" id="crop-confirm">✓ Usar esta Imagem</button>
      `,
      maxWidth: '540px'
    });

    // Lazy load Cropper
    import('cropperjs').then(({ default: Cropper }) => {
      // Import cropper CSS
      if (!document.getElementById('cropper-css')) {
        const link = document.createElement('link');
        link.id = 'cropper-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.css';
        document.head.appendChild(link);
      }

      const img = document.getElementById('crop-img');
      const cropper = new Cropper(img, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 0.85,
        movable: true,
        zoomable: true,
        rotatable: false,
        scalable: false,
      });

      document.getElementById('crop-cancel').addEventListener('click', () => {
        cropper.destroy(); close(); resolve();
      });

      document.getElementById('crop-confirm').addEventListener('click', () => {
        const canvas = cropper.getCroppedCanvas({ width: 800, height: 800, imageSmoothingQuality: 'high' });
        canvas.toBlob(blob => {
          const url = URL.createObjectURL(blob);
          onCrop(blob, url);
          cropper.destroy();
          close();
          resolve();
        }, 'image/webp', 0.85);
      });
    });
  });
}
