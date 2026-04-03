(() => {
  const MAX_FILES  = 10;
  const MAX_BYTES  = 8 * 1024 * 1024;
  const ACCEPTED   = ['image/jpeg', 'image/png', 'image/webp'];

  const dropzone   = document.getElementById('dropzone');
  const fileInput  = document.getElementById('file-upload');
  const preview    = document.getElementById('image-preview');
  const countEl    = document.getElementById('file-count');

  if (!dropzone || !fileInput || !preview) return;

  // UI-only state
  let files = [];

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
    handleFiles(fileInput.files);

    // IMPORTANT: reset safely
    setTimeout(() => {
      fileInput.value = '';
    }, 0);
  });

  // ── CORE LOGIC ────────────────────────────
  function handleFiles(fileList) {
    const incoming = Array.from(fileList);
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
      showToast(`Seulement ${remaining} ajoutées.`);
    }

    render();
  }

  // ── RENDER ────────────────────────────────
  function render() {
    preview.innerHTML = '';
    files.forEach((entry, i) => renderCard(entry, i));
    updateCount();
  }

  function renderCard({ objectUrl, file, error }, index) {
    const card = document.createElement('div');
    card.className = 'preview-card';

    if (objectUrl && !error) {
      const img = document.createElement('img');
      img.src = objectUrl;
      card.appendChild(img);
    }

    if (error) {
      const err = document.createElement('div');
      err.className = 'error-overlay';
      err.textContent = error;
      card.appendChild(err);
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.innerHTML = '×';
    btn.className = 'btn-remove';
    btn.onclick = () => removeFile(index);

    card.appendChild(btn);
    preview.appendChild(card);
  }

  function removeFile(index) {
    const f = files[index];
    if (f.objectUrl) URL.revokeObjectURL(f.objectUrl);
    files.splice(index, 1);
    render();
  }

  function updateCount() {
    const valid = files.filter(f => !f.error).length;
    countEl.textContent = `${valid} photo(s)`;
  }

  // ── FORM SUBMISSION FIX ───────────────────
  // Inject files manually on submit
  const form = fileInput.closest('form');

  if (form) {
    form.addEventListener('submit', (e) => {
      // remove previous dynamic inputs
      form.querySelectorAll('.dynamic-file').forEach(el => el.remove());

      files.forEach(({ file, error }) => {
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