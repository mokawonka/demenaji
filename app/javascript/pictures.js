(() => {
  const MAX_FILES  = 20;
  const MAX_BYTES  = 8 * 1024 * 1024;
  const ACCEPTED   = ['image/jpeg', 'image/png', 'image/webp'];

  const dropzone   = document.getElementById('dropzone');
  const fileInput  = document.getElementById('file-upload');
  const preview    = document.getElementById('image-preview');
  const countEl    = document.getElementById('file-count');

  if (!dropzone || !fileInput || !preview) return;

  let files = [];
  let mainIndex = 0;

  // ── EVENTS ────────────────────────────────
  dropzone.addEventListener('click', (e) => {
    if (!e.target.closest('label')) fileInput.click();
  });

  dropzone.addEventListener('dragover', e => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-over');
  });

  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', () => {
    const selectedFiles = Array.from(fileInput.files);

    // 🔥 CRITICAL FIX: defer heavy work
    requestAnimationFrame(() => {
      handleFiles(selectedFiles);
    });

    setTimeout(() => {
      fileInput.value = '';
    }, 0);
  });

  // ── CORE ──────────────────────────────────
  function handleFiles(fileList) {
    const remaining = MAX_FILES - files.length;

    if (remaining <= 0) {
      showToast(`Maximum ${MAX_FILES} photos atteint.`);
      return;
    }

    fileList.slice(0, remaining).forEach(file => {
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

    render();
  }

  // ── RENDER ────────────────────────────────
  function render() {
    preview.innerHTML = '';

    files.forEach((entry, i) => {
      preview.appendChild(renderCard(entry, i));
    });

    updateCount();
  }

  function renderCard({ objectUrl, file, error }, index) {
    const card = document.createElement('div');
    card.className = 'preview-card';
    card.draggable = true;
    card.dataset.index = index;

    // IMAGE
    if (objectUrl && !error) {
      const img = document.createElement('img');
      img.src = objectUrl;
      card.appendChild(img);
    }

    // ERROR
    if (error) {
      const err = document.createElement('div');
      err.className = 'error-overlay';
      err.textContent = error;
      card.appendChild(err);
    }

    // INDEX BADGE
    const badge = document.createElement('div');
    badge.className = 'badge-index';
    badge.textContent = index + 1;
    card.appendChild(badge);

    // MAIN PHOTO BADGE
    if (index === mainIndex) {
      const main = document.createElement('div');
      main.className = 'badge-main';
      main.textContent = 'Principale';
      card.appendChild(main);
    }

    // CLICK = SET MAIN PHOTO
    card.addEventListener('click', () => {
      mainIndex = index;
      render();
    });

    // REMOVE BUTTON
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.innerHTML = '×';
    btn.className = 'btn-remove';

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeFile(index);
    });

    card.appendChild(btn);

    // ── DRAG & DROP REORDER ─────────────────
    card.addEventListener('dragstart', onDragStart);
    card.addEventListener('dragover', e => e.preventDefault());
    card.addEventListener('drop', onDrop);
    card.addEventListener('dragend', onDragEnd);

    return card;
  }

  // ── REMOVE ────────────────────────────────
  function removeFile(index) {
    const f = files[index];
    if (f.objectUrl) URL.revokeObjectURL(f.objectUrl);

    files.splice(index, 1);

    if (mainIndex >= files.length) mainIndex = 0;

    render();
  }

  // ── DRAG REORDER ──────────────────────────
  let dragIndex = null;

  function onDragStart(e) {
    dragIndex = +e.currentTarget.dataset.index;
  }

  function onDrop(e) {
    const targetIndex = +e.currentTarget.dataset.index;
    if (dragIndex === targetIndex) return;

    const moved = files.splice(dragIndex, 1)[0];
    files.splice(targetIndex, 0, moved);

    if (mainIndex === dragIndex) mainIndex = targetIndex;

    render();
  }

  function onDragEnd() {
    dragIndex = null;
  }

  // ── COUNT ────────────────────────────────
  function updateCount() {
    const valid = files.filter(f => !f.error).length;
    countEl.textContent = `${valid} photo(s)`;
  }

  // ── FORM SUBMIT ──────────────────────────
  const form = fileInput.closest('form');

  if (form) {
    form.addEventListener('submit', () => {
      form.querySelectorAll('.dynamic-file').forEach(el => el.remove());

      // 👉 MAIN IMAGE FIRST
      const ordered = [...files];
      if (ordered.length > 1) {
        const main = ordered.splice(mainIndex, 1)[0];
        ordered.unshift(main);
      }

      ordered.forEach(({ file, error }) => {
        if (error) return;

        const input = document.createElement('input');
        input.type = 'file';
        input.name = fileInput.name;
        input.classList.add('dynamic-file');

        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;

        input.style.display = 'none';
        form.appendChild(input);
      });
    });
  }

  // ── TOAST ────────────────────────────────
  function showToast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, {
      position: 'fixed',
      bottom: '1rem',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#000',
      color: '#fff',
      padding: '8px 16px',
      borderRadius: '8px',
      zIndex: 9999
    });
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
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