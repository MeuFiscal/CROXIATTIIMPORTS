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
async function openProductForm(produto, onSave) {
  const isEdit = !!produto;
  
  // Load categories
  const { data: cats } = await supabase.from('categorias').select('id, nome').order('ordem', { ascending: true });
  const catOptions = (cats || []).map(c => 
    `<option value="${c.id}" ${produto?.categoria_id === c.id ? 'selected' : ''}>${c.nome}</option>`
  ).join('');

  const body = `
    <form id="prod-form" novalidate style="display:flex;flex-direction:column;gap:16px">
      <div class="form-group">
        <label class="form-label">Imagens do Produto (Até 3 fotos)</label>
        <div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:8px;">
          ${[1, 2, 3].map(i => {
            const pUrl = i === 1 ? produto?.imagem_url : (i === 2 ? produto?.imagem_url_2 : produto?.imagem_url_3);
            return `
            <div style="flex:0 0 120px;display:flex;flex-direction:column;gap:8px;">
              <div id="img-preview-wrap-${i}" style="position:relative;${pUrl ? '' : 'display:none'}">
                <img id="current-preview-${i}" src="${pUrl || ''}" style="width:120px;height:120px;object-fit:cover;border-radius:8px;border:1px solid var(--gray-200)" />
                <button type="button" class="img-remove-btn" data-slot="${i}" style="position:absolute;top:-6px;right:-6px;background:var(--error);color:#fff;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;font-size:12px;line-height:1;display:flex;align-items:center;justify-content:center;">✕</button>
              </div>
              <div class="upload-area" id="upload-area-${i}" data-slot="${i}" style="width:120px;height:120px;border:2px dashed var(--gray-300);border-radius:8px;display:${pUrl ? 'none' : 'flex'};align-items:center;justify-content:center;cursor:pointer;flex-direction:column;background:var(--gray-50);transition:all 0.2s;">
                <div style="font-size:24px;opacity:0.5">📷</div>
                <div style="font-size:11px;color:var(--gray-500);margin-top:4px">Foto ${i}</div>
                <input type="file" id="img-file-input-${i}" accept="image/*" style="display:none" />
              </div>
            </div>
            `;
          }).join('')}
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
        <div class="form-group" style="grid-column:1/-1">
          <label class="form-label" for="p-nome">Nome *</label>
          <input class="form-input" type="text" id="p-nome" value="${produto?.nome || ''}" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="p-categoria">Categoria</label>
          <select class="form-input" id="p-categoria" style="padding:10px 14px; background:var(--gray-50); border:1px solid var(--gray-200); border-radius:8px;">
            <option value="">Sem categoria</option>
            ${catOptions}
          </select>
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
          <input type="checkbox" id="p-mais-encomendado" ${produto?.mais_encomendado ? 'checked' : ''} />
          <div class="track"></div>
          <span style="font-size:.88rem">Mais Encomendado</span>
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

  // Fetch categories and populate select
  // (Categories are now fetched directly inside openProductForm async)

  document.getElementById('prod-cancel').addEventListener('click', close);

  // Upload area state
  const imgState = {
    1: { croppedBlob: null, previewUrl: produto?.imagem_url || null, removed: false },
    2: { croppedBlob: null, previewUrl: produto?.imagem_url_2 || null, removed: false },
    3: { croppedBlob: null, previewUrl: produto?.imagem_url_3 || null, removed: false },
  };

  [1, 2, 3].forEach(i => {
    const uploadArea = document.getElementById(`upload-area-${i}`);
    const fileInput = document.getElementById(`img-file-input-${i}`);
    const previewWrap = document.getElementById(`img-preview-wrap-${i}`);
    const currentPreview = document.getElementById(`current-preview-${i}`);
    const removeBtn = previewWrap.querySelector('.img-remove-btn');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.style.borderColor = 'var(--gold)'; });
    uploadArea.addEventListener('dragleave', () => uploadArea.style.borderColor = 'var(--gray-300)');
    uploadArea.addEventListener('drop', e => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--gray-300)';
      const file = e.dataTransfer.files[0];
      if (file) processImageFile(i, file);
    });
    fileInput.addEventListener('change', e => { if (e.target.files[0]) processImageFile(i, e.target.files[0]); });
    removeBtn.addEventListener('click', () => {
      imgState[i].previewUrl = null;
      imgState[i].croppedBlob = null;
      imgState[i].removed = true;
      previewWrap.style.display = 'none';
      uploadArea.style.display = 'flex';
      currentPreview.src = '';
    });

    function processImageFile(slot, file) {
      imgState[slot].croppedBlob = file;
      imgState[slot].previewUrl = URL.createObjectURL(file);
      imgState[slot].removed = false;
      currentPreview.src = imgState[slot].previewUrl;
      previewWrap.style.display = 'block';
      uploadArea.style.display = 'none';
    }
  });

  // Save
  document.getElementById('prod-save').addEventListener('click', async () => {
    const saveBtn = document.getElementById('prod-save');
    const isEdit = !!produto;

    try {
      const nome = document.getElementById('p-nome').value.trim();
      const preco = parseFloat(document.getElementById('p-preco').value);
      const errEl = document.getElementById('prod-form-error');

      if (!nome || isNaN(preco) || preco < 0) {
        errEl.textContent = 'Preencha nome e preço corretamente.';
        errEl.style.display = 'block';
        return;
      }
      errEl.style.display = 'none';

      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span class="loader-ring" style="width:16px;height:16px;border-width:2px"></span>';

    let imgUrls = {
      1: produto?.imagem_url || null
    };

    for (let i of [1]) {
      if (imgState[i].croppedBlob) {
        const fileExt = imgState[i].croppedBlob.name.split('.').pop();
        const fileName = `produto_${i}_${Date.now()}.${fileExt}`;
        const { data: upData, error: upErr } = await supabase.storage
          .from('produtos')
          .upload(fileName, imgState[i].croppedBlob, { contentType: imgState[i].croppedBlob.type, upsert: false });
        if (upErr) {
          showToast('Erro no upload da imagem ' + i + ': ' + upErr.message, 'error');
          saveBtn.disabled = false;
          saveBtn.textContent = isEdit ? 'Salvar Alterações' : 'Cadastrar Produto';
          return;
        }
        const { data: urlData } = supabase.storage.from('produtos').getPublicUrl(upData.path);
        imgUrls[i] = urlData.publicUrl;
      } else if (imgState[i].removed || !imgState[i].previewUrl) {
        imgUrls[i] = null;
      }
    }

    const catVal = document.getElementById('p-categoria').value;
    const payload = {
      nome,
      marca: document.getElementById('p-marca').value.trim() || null,
      preco,
      quantidade: parseInt(document.getElementById('p-qty').value) || 0,
      descricao: document.getElementById('p-desc').value.trim() || null,
      destaque: document.getElementById('p-destaque').checked,
      apenas_encomenda: document.getElementById('p-encomenda').checked,
      categoria_id: catVal ? catVal : null,
      imagem_url: imgUrls[1],
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
    if (onSave) onSave();
    
    } catch (err) {
      console.error(err);
      showToast('Erro inesperado: ' + err.message, 'error');
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = isEdit ? 'Salvar Alterações' : 'Cadastrar Produto';
      }
    }
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
        aspectRatio: NaN, // Livre, permite pegar a imagem inteira na proporção original
        viewMode: 1,
        autoCropArea: 1, // Seleciona a imagem inteira por padrão
        movable: true,
        zoomable: true,
        rotatable: false,
        scalable: false,
      });

      document.getElementById('crop-cancel').addEventListener('click', () => {
        cropper.destroy(); close(); resolve();
      });

      document.getElementById('crop-confirm').addEventListener('click', () => {
        const canvas = cropper.getCroppedCanvas({ maxWidth: 1000, maxHeight: 1000, imageSmoothingQuality: 'high' });
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
