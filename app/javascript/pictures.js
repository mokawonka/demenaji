(() => {
  const MAX_FILES  = 10;
  const MAX_BYTES  = 8 * 1024 * 1024; // 8 MB
  const ACCEPTED   = ['image/jpeg', 'image/png', 'image/webp'];

  const dropzone   = document.getElementById('dropzone');
  const fileInput  = document.getElementById('file-upload');
  const preview    = document.getElementById('image-preview');
  const countEl    = document.getElementById('file-count');

  if (!dropzone || !fileInput || !preview) return;

  // Internal ordered list of { file, objectUrl, error }
  let files = [];

  // ── Drag-and-drop on dropzone ──────────────
  dropzone.addEventListener('dragover', e => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  });
  ['dragleave', 'drop'].forEach(ev =>
    dropzone.addEventListener(ev, () => dropzone.classList.remove('drag-over'))
  );
  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  });
  dropzone.addEventListener('click', e => {
    if (e.target.closest('label')) return; // let label handle it
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    addFiles(fileInput.files);
    fileInput.value = ''; // reset so same file can be re-added after removal
  });

  // ── Add & validate files ───────────────────
  function addFiles(rawList) {
    const incoming = Array.from(rawList);
    const remaining = MAX_FILES - files.length;

    if (remaining <= 0) {
      showToast(`Maximum ${MAX_FILES} photos atteint.`);
      return;
    }

    incoming.slice(0, remaining).forEach(file => {
      const entry = { file, objectUrl: null, error: null };

      if (!ACCEPTED.includes(file.type)) {
        entry.error = 'Format non supporté';
      } else if (file.size > MAX_BYTES) {
        entry.error = 'Dépasse 8 Mo';
      } else {
        entry.objectUrl = URL.createObjectURL(file);
      }

      files.push(entry);
    });

    if (incoming.length > remaining) {
      showToast(`Seulement ${remaining} photo(s) ajoutée(s) — limite de ${MAX_FILES} atteinte.`);
    }

    syncInput();
    render();
  }

  // ── Sync the real file input ───────────────
  // We rebuild a DataTransfer every time so the form submits the right files.
  function syncInput() {
    const dt = new DataTransfer();
    files.forEach(({ file, error }) => {
      if (!error) dt.items.add(file);
    });
    fileInput.files = dt.files;
  }

  // ── Render previews ────────────────────────
  function render() {
    preview.innerHTML = '';
    files.forEach((entry, i) => renderCard(entry, i));
    updateCount();
  }

  function renderCard({ objectUrl, file, error }, index) {
    const card = document.createElement('div');
    card.className = 'preview-card';
    card.draggable = true;
    card.dataset.index = index;

    if (objectUrl && !error) {
      const img = document.createElement('img');
      img.src = objectUrl;
      img.alt = file.name;
      card.appendChild(img);

      const badge = document.createElement('div');
      badge.className = 'badge-index';
      badge.textContent = index + 1;
      card.appendChild(badge);

      if (index === 0) {
        const main = document.createElement('div');
        main.className = 'badge-main';
        main.textContent = 'Principale';
        card.appendChild(main);
      }
    } else {
      // Fallback thumbnail with error
      const img = document.createElement('img');
      img.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23fecaca"/></svg>';
      img.alt = 'error';
      card.appendChild(img);

      const overlay = document.createElement('div');
      overlay.className = 'error-overlay';
      overlay.textContent = error || 'Erreur';
      card.appendChild(overlay);
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-remove';
    btn.innerHTML = '&times;';
    btn.title = 'Supprimer';
    btn.addEventListener('click', () => removeFile(index));
    card.appendChild(btn);

    // ── Card drag-to-reorder ─────────────────
    card.addEventListener('dragstart', onDragStart);
    card.addEventListener('dragenter', onDragEnter);
    card.addEventListener('dragleave', onDragLeave);
    card.addEventListener('dragover', e => e.preventDefault());
    card.addEventListener('drop', onDrop);
    card.addEventListener('dragend', onDragEnd);

    preview.appendChild(card);
  }

  // ── Remove ─────────────────────────────────
  function removeFile(index) {
    const { objectUrl } = files[index];
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    files.splice(index, 1);
    syncInput();
    render();
  }

  // ── Count bar ──────────────────────────────
  function updateCount() {
    const valid = files.filter(f => !f.error).length;
    const total = files.length;
    const errors = total - valid;

    if (total === 0) {
      countEl.textContent = '';
      countEl.classList.remove('limit-reached');
      return;
    }

    let msg = `<span class="count-num">${valid}</span> photo${valid > 1 ? 's' : ''} sélectionnée${valid > 1 ? 's' : ''}`;
    if (errors > 0) msg += ` · <span style="color:#dc2626">${errors} rejeté${errors > 1 ? 's' : ''}</span>`;
    if (valid >= MAX_FILES) {
      countEl.classList.add('limit-reached');
      msg += ` · Limite atteinte`;
    } else {
      countEl.classList.remove('limit-reached');
    }
    countEl.innerHTML = msg;
  }

  // ── Drag-to-reorder logic ──────────────────
  let dragSrcIndex = null;

  function onDragStart(e) {
    dragSrcIndex = +e.currentTarget.dataset.index;
    e.currentTarget.classList.add('drag-source');
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDragEnter(e) {
    e.preventDefault();
    if (+e.currentTarget.dataset.index !== dragSrcIndex)
      e.currentTarget.classList.add('drag-target');
  }

  function onDragLeave(e) {
    e.currentTarget.classList.remove('drag-target');
  }

  function onDrop(e) {
    e.preventDefault();
    const targetIndex = +e.currentTarget.dataset.index;
    if (targetIndex === dragSrcIndex) return;

    const moved = files.splice(dragSrcIndex, 1)[0];
    files.splice(targetIndex, 0, moved);
    syncInput();
    render();
  }

  function onDragEnd(e) {
    e.currentTarget.classList.remove('drag-source');
    document.querySelectorAll('.preview-card').forEach(c =>
      c.classList.remove('drag-target')
    );
    dragSrcIndex = null;
  }

  // ── Toast helper ───────────────────────────
  function showToast(msg) {
    const t = document.createElement('div');
    Object.assign(t.style, {
      position: 'fixed', bottom: '1.5rem', left: '50%',
      transform: 'translateX(-50%)',
      background: '#1f2937', color: '#fff',
      padding: '0.6rem 1.25rem', borderRadius: '0.75rem',
      fontSize: '0.9rem', zIndex: 9999,
      pointerEvents: 'none', opacity: '0',
      transition: 'opacity 0.2s'
    });
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => { t.style.opacity = '1'; });
    setTimeout(() => {
      t.style.opacity = '0';
      t.addEventListener('transitionend', () => t.remove());
    }, 3000);
  }
})();


const pictureUpload = document.getElementById('profile_picture_upload');

if (pictureUpload) {

    pictureUpload.addEventListener('change', function() {
        if (!this.files || !this.files[0]) return;
        var reader = new FileReader();
        reader.onload = function(e) {
            var preview = document.getElementById('imagePreview');
            if (preview.tagName === 'IMG') {
                preview.src = e.target.result;
            } else {
                var img = document.createElement('img');
                img.id = 'imagePreview';
                img.src = e.target.result;
                img.style.cssText = 'width:120px; height:120px; border-radius:50%; object-fit:cover; border:4px solid #f3f2f2; box-shadow:0 2px 12px rgba(0,0,0,0.10);';
                preview.replaceWith(img);
            }
        };
        reader.readAsDataURL(this.files[0]);
    });

}