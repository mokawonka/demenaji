const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-upload');
const previewContainer = document.getElementById('image-preview');
const fileCountEl = document.getElementById('file-count');

if (dropzone && fileInput) {

    let filesArray = [];

    // ── Render ──────────────────────────────────────────────────────────────
    function renderPreviews() {
        previewContainer.innerHTML = '';
        fileCountEl.textContent = filesArray.length
            ? `${filesArray.length} photo${filesArray.length > 1 ? 's' : ''} sélectionnée${filesArray.length > 1 ? 's' : ''}`
            : '';

        filesArray.forEach((file, index) => {
            const url = URL.createObjectURL(file);

            const wrapper = document.createElement('div');
            wrapper.className = 'relative';

            const img = document.createElement('img');
            img.src = url;
            img.onload = () => URL.revokeObjectURL(url);

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = '✕';
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                filesArray.splice(index, 1);
                renderPreviews();
            });

            const name = document.createElement('div');
            name.className = 'text-xs';
            name.textContent = file.name;

            wrapper.appendChild(img);
            wrapper.appendChild(btn);
            wrapper.appendChild(name);
            previewContainer.appendChild(wrapper);
        });
    }

    // ── Sync to input on submit ──────────────────────────────────────────────
    function syncFilesToInput() {
        const dt = new DataTransfer();
        filesArray.forEach(f => dt.items.add(f));
        fileInput.files = dt.files;
    }

    // ── Add files ───────────────────────────────────────────────────────────
    function addFiles(newFiles) {
        const images = Array.from(newFiles).filter(f => f.type.startsWith('image/'));
        filesArray = [...filesArray, ...images].slice(0, 10);
        renderPreviews();
    }

    // ── Browse via hidden input ──────────────────────────────────────────────
    const pickerInput = document.createElement('input');
    pickerInput.type = 'file';
    pickerInput.multiple = true;
    pickerInput.accept = 'image/jpeg,image/png,image/webp';
    pickerInput.style.cssText = 'display:none;';
    document.body.appendChild(pickerInput);

    pickerInput.addEventListener('change', function() {
        addFiles(this.files);
        this.value = '';
    });

    // Original file input (used only for form submission)
    fileInput.style.display = 'none';

    // ── Dropzone click ──────────────────────────────────────────────────────
    dropzone.addEventListener('click', function(e) {
        if (e.target.closest('button')) return;
        pickerInput.click();
    });

    // ── Browse label click ──────────────────────────────────────────────────
    const browseLabel = dropzone.querySelector('label');
    if (browseLabel) {
        browseLabel.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            pickerInput.click();
        });
    }

    // ── Drag & drop ─────────────────────────────────────────────────────────
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '#ff8138';
        dropzone.style.background = '#fff7f0';
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.style.borderColor = '';
        dropzone.style.background = '';
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '';
        dropzone.style.background = '';
        addFiles(e.dataTransfer.files);
    });

    // ── Sync on submit ──────────────────────────────────────────────────────
    const form = dropzone.closest('form');
    form.addEventListener('submit', function() {
        syncFilesToInput();
    });

}

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