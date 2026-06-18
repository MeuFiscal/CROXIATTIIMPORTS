// ======================================================
// ADMIN DESTAQUES (Banners Promocionais)
// ======================================================
import { supabase } from '../../supabase.js';
import { requireAdmin, renderAdminLayout } from './layout.js';
import { showToast } from '../../components/toast.js';
import { openModal, confirmModal } from '../../components/modal.js';

export async function renderAdminDestaques(container) {
  if (!await requireAdmin()) return;

  return renderAdminLayout(container, 'Destaques', async (content) => {
    content.innerHTML = `
      <div class="admin-table-wrap">
        <div class="admin-table-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
          <div>
            <h2 style="font-size:1.2rem;font-weight:600;margin:0;color:var(--black)">Banners Promocionais</h2>
            <p style="font-size:.82rem;color:var(--gray-500);margin:4px 0 0">Aparecem entre o hero e os produtos na página inicial</p>
          </div>
          <button class="btn btn-primary" id="add-banner-btn" style="gap:8px;display:flex;align-items:center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Adicionar Banner
          </button>
        </div>
        <div id="banners-list">
          <div style="padding:48px;text-align:center;color:var(--gray-400)">Carregando banners...</div>
        </div>
      </div>

      <!-- Upload form (hidden by default) -->
      <div id="banner-form-wrap" style="display:none;margin-top:24px;" class="admin-table-wrap">
        <h3 style="font-size:1rem;font-weight:600;margin:0 0 16px;color:var(--black)" id="form-title">Novo Banner</h3>
        <div style="display:flex;flex-direction:column;gap:16px;max-width:640px;">
          <div>
            <label style="display:block;font-size:.85rem;font-weight:500;margin-bottom:6px;color:var(--gray-600)">Título (opcional)</label>
            <input type="text" id="banner-titulo" class="form-input" placeholder="Ex: Promoção de Verão" style="max-width:400px;" />
          </div>
          <div>
            <label style="display:block;font-size:.85rem;font-weight:500;margin-bottom:6px;color:var(--gray-600)">Imagem do Banner *</label>
            <div id="banner-drop-zone" style="border:2px dashed var(--gray-300);border-radius:12px;padding:32px;text-align:center;cursor:pointer;transition:all 0.2s;background:var(--gray-50);">
              <div id="banner-preview-wrap" style="display:none;margin-bottom:16px;">
                <img id="banner-preview" src="" alt="Preview" style="max-width:100%;max-height:220px;object-fit:contain;border-radius:8px;" />
              </div>
              <div id="banner-placeholder" style="color:var(--gray-400);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40" style="margin:0 auto 12px;display:block;opacity:.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <p style="margin:0 0 8px;font-size:.9rem;font-weight:500">Clique ou arraste a imagem aqui</p>
                <p style="margin:0;font-size:.78rem;color:var(--gray-400)">JPG, PNG, WebP — Recomendado 1200×400px</p>
              </div>
              <input type="file" id="banner-file-input" accept="image/*" style="display:none" />
            </div>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button class="btn btn-primary" id="save-banner-btn">Salvar Banner</button>
            <button class="btn btn-ghost" id="cancel-banner-btn">Cancelar</button>
          </div>
        </div>
      </div>
    `;

    let editingId = null;
    let selectedFile = null;
    let currentImgUrl = null;

    const listEl = content.querySelector('#banners-list');
    const formWrap = content.querySelector('#banner-form-wrap');
    const addBtn = content.querySelector('#add-banner-btn');
    const cancelBtn = content.querySelector('#cancel-banner-btn');
    const saveBtn = content.querySelector('#save-banner-btn');
    const dropZone = content.querySelector('#banner-drop-zone');
    const fileInput = content.querySelector('#banner-file-input');
    const previewWrap = content.querySelector('#banner-preview-wrap');
    const previewImg = content.querySelector('#banner-preview');
    const placeholder = content.querySelector('#banner-placeholder');

    // ---- Load banners ----
    const load = async () => {
      listEl.innerHTML = '<div style="padding:32px;text-align:center;color:var(--gray-400)">Carregando...</div>';
      const { data } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
      const banners = data || [];

      if (!banners.length) {
        listEl.innerHTML = `
          <div class="admin-table-empty" style="padding:48px;text-align:center;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48" style="margin:0 auto 16px;display:block;opacity:.3"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <p style="color:var(--gray-400);margin:0">Nenhum banner cadastrado ainda</p>
          </div>`;
        return;
      }

      listEl.innerHTML = banners.map(b => `
        <div class="banner-admin-card" data-id="${b.id}" style="border:1px solid var(--gray-200);border-radius:12px;overflow:hidden;margin-bottom:16px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
          <div style="position:relative;">
            <img src="${b.imagem_url}" alt="${b.titulo || 'Banner'}" style="width:100%;max-height:200px;object-fit:cover;display:block;" onerror="this.style.background='var(--gray-100)';this.style.height='120px'" />
            <span style="position:absolute;top:10px;right:10px;padding:4px 12px;border-radius:20px;font-size:.75rem;font-weight:600;${b.ativo ? 'background:rgba(34,197,94,0.9);color:#fff' : 'background:rgba(0,0,0,0.5);color:#fff'}">
              ${b.ativo ? '● Ativo' : '○ Inativo'}
            </span>
          </div>
          <div style="padding:14px 16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
            <div>
              <div style="font-weight:600;font-size:.92rem;color:var(--black)">${b.titulo || 'Banner sem título'}</div>
              <div style="font-size:.75rem;color:var(--gray-400);margin-top:2px">${new Date(b.created_at).toLocaleDateString('pt-BR')}</div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <button class="btn btn-sm ${b.ativo ? 'btn-ghost' : 'btn-success'} toggle-btn" data-id="${b.id}" data-ativo="${b.ativo}" style="font-size:.78rem;">
                ${b.ativo ? '⏸ Desativar' : '▶ Ativar'}
              </button>
              <button class="btn btn-sm btn-ghost edit-btn" data-id="${b.id}" data-titulo="${(b.titulo || '').replace(/"/g, '&quot;')}" data-img="${b.imagem_url}" style="font-size:.78rem;">
                ✏️ Trocar Foto
              </button>
              <button class="btn btn-sm btn-danger delete-btn" data-id="${b.id}" style="font-size:.78rem;background:#ef4444;color:#fff;border:none;">
                🗑 Excluir
              </button>
            </div>
          </div>
        </div>
      `).join('');

      // Toggle ativo/inativo
      listEl.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const newAtivo = btn.dataset.ativo === 'true' ? false : true;
          const { error } = await supabase.from('banners').update({ ativo: newAtivo }).eq('id', btn.dataset.id);
          if (error) { showToast('Erro ao atualizar', 'error'); return; }
          showToast(newAtivo ? 'Banner ativado!' : 'Banner desativado!', 'success');
          load();
        });
      });

      // Edit / Trocar foto
      listEl.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          editingId = btn.dataset.id;
          currentImgUrl = btn.dataset.img;
          content.querySelector('#banner-titulo').value = btn.dataset.titulo;
          content.querySelector('#form-title').textContent = 'Trocar Foto do Banner';
          selectedFile = null;
          previewImg.src = currentImgUrl;
          previewWrap.style.display = 'block';
          placeholder.style.display = 'none';
          formWrap.style.display = 'block';
          formWrap.scrollIntoView({ behavior: 'smooth' });
        });
      });

      // Delete
      listEl.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const ok = await confirmModal({ title: 'Excluir Banner', message: 'Tem certeza? Esta ação não pode ser desfeita.', danger: true, confirmText: 'Excluir' });
          if (!ok) return;
          const { error } = await supabase.from('banners').delete().eq('id', btn.dataset.id);
          if (error) { showToast('Erro ao excluir', 'error'); return; }
          showToast('Banner excluído!', 'success');
          load();
        });
      });
    };

    // ---- Image Crop Modal ----
    const openCropModal = (file, onCropComplete) => {
      const url = URL.createObjectURL(file);
      const body = `
        <div style="max-height:60vh;overflow:hidden;background:#000">
          <img id="crop-img-modal" src="${url}" style="max-width:100%;display:block;" />
        </div>
      `;
      const footer = `
        <button class="btn btn-ghost" id="crop-cancel-btn">Cancelar</button>
        <button class="btn btn-primary" id="crop-save-btn">Aplicar Enquadramento</button>
      `;

      const { close } = openModal({
        title: 'Enquadrar Imagem (3:1)',
        body,
        footer,
        maxWidth: '800px'
      });

      const img = document.getElementById('crop-img-modal');

      import('cropperjs').then(({ default: Cropper }) => {
        if (!document.getElementById('cropper-css')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.id = 'cropper-css';
          link.href = 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.css';
          document.head.appendChild(link);
        }

        setTimeout(() => {
          const cropper = new Cropper(img, {
            aspectRatio: 3, // 1200 / 400
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 1,
            background: false,
            movable: true,
            zoomable: true,
            rotatable: false,
            scalable: false
          });

          document.getElementById('crop-cancel-btn').addEventListener('click', () => {
            cropper.destroy();
            close();
          });

          document.getElementById('crop-save-btn').addEventListener('click', () => {
            const canvas = cropper.getCroppedCanvas({ maxWidth: 2400, maxHeight: 800, imageSmoothingQuality: 'high' });
            canvas.toBlob(blob => {
              cropper.destroy();
              close();
              onCropComplete(blob, file.name);
            }, 'image/jpeg', 0.9);
          });
        }, 100);
      });
    };

    // ---- File input / drag and drop ----
    const setPreview = (file) => {
      openCropModal(file, (croppedBlob, originalName) => {
        selectedFile = croppedBlob;
        selectedFile.name = originalName;
        const url = URL.createObjectURL(croppedBlob);
        previewImg.src = url;
        previewWrap.style.display = 'block';
        placeholder.style.display = 'none';
        dropZone.style.borderColor = 'var(--gold)';
      });
    };

    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', e => { if (e.target.files[0]) setPreview(e.target.files[0]); });
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.style.borderColor = 'var(--gold)'; dropZone.style.background = 'var(--gold-pale)'; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = 'var(--gray-300)'; dropZone.style.background = 'var(--gray-50)'; });
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.style.borderColor = 'var(--gray-300)';
      dropZone.style.background = 'var(--gray-50)';
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) setPreview(file);
    });

    // ---- Show/hide form ----
    addBtn.addEventListener('click', () => {
      editingId = null;
      currentImgUrl = null;
      selectedFile = null;
      content.querySelector('#banner-titulo').value = '';
      content.querySelector('#form-title').textContent = 'Novo Banner';
      previewWrap.style.display = 'none';
      placeholder.style.display = 'block';
      dropZone.style.borderColor = 'var(--gray-300)';
      formWrap.style.display = 'block';
      formWrap.scrollIntoView({ behavior: 'smooth' });
    });

    cancelBtn.addEventListener('click', () => {
      formWrap.style.display = 'none';
      editingId = null;
      selectedFile = null;
    });

    // ---- Save ----
    saveBtn.addEventListener('click', async () => {
      const titulo = content.querySelector('#banner-titulo').value.trim();

      if (!selectedFile && !editingId) {
        showToast('Selecione uma imagem para o banner', 'error');
        return;
      }

      saveBtn.disabled = true;
      saveBtn.textContent = 'Salvando...';

      try {
        let imgUrl = currentImgUrl;

        if (selectedFile) {
          const ext = selectedFile.name.split('.').pop();
          const fileName = `banner_${Date.now()}.${ext}`;
          const { data: upData, error: upErr } = await supabase.storage
            .from('produtos')
            .upload(fileName, selectedFile, { contentType: selectedFile.type, upsert: false });
          if (upErr) throw upErr;
          const { data: urlData } = supabase.storage.from('produtos').getPublicUrl(upData.path);
          imgUrl = urlData.publicUrl;
        }

        if (editingId) {
          const payload = { titulo: titulo || null, imagem_url: imgUrl };
          const { error } = await supabase.from('banners').update(payload).eq('id', editingId);
          if (error) throw error;
          showToast('Banner atualizado!', 'success');
        } else {
          const { error } = await supabase.from('banners').insert({ titulo: titulo || null, imagem_url: imgUrl, ativo: true });
          if (error) throw error;
          showToast('Banner adicionado!', 'success');
        }

        formWrap.style.display = 'none';
        editingId = null;
        selectedFile = null;
        load();
      } catch (err) {
        console.error(err);
        showToast('Erro ao salvar: ' + err.message, 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Salvar Banner';
      }
    });

    load();
  });
}
