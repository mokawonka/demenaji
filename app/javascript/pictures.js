const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-upload');
const previewContainer = document.getElementById('image-preview');
const fileCountEl = document.getElementById('file-count');

if (dropzone && fileInput) {

    let filesArray = [];

    // Prevent label click from bubbling up to dropzone (stops double dialog)
    const browseLabel = dropzone.querySelector('label');
    if (browseLabel) {
        browseLabel.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    function renderPreviews() {
        previewContainer.innerHTML = '';

        if (filesArray.length === 0) {
            fileCountEl.textContent = '';
            return;
        }

        filesArray.forEach((file, index) => {
            const div = document.createElement('div');
            div.className = 'relative group';
            div.style.cssText = 'position:relative;';
            previewContainer.appendChild(div); // append immediately so order is preserved

            const reader = new FileReader();
            reader.onload = function (e) {
                div.innerHTML = `
                    <img src="${e.target.result}" 
                        style="width:100%; aspect-ratio:1; object-fit:cover; border-radius:12px; border:1px solid #e5e7eb; box-shadow:0 1px 4px rgba(0,0,0,0.08);">
                    <button type="button" 
                            data-index="${index}"
                            style="position:absolute; top:6px; right:6px; background:#ef4444; color:white;
                                   width:22px; height:22px; border-radius:50%; border:none; cursor:pointer;
                                   font-size:12px; display:flex; align-items:center; justify-content:center;
                                   box-shadow:0 1px 4px rgba(0,0,0,0.2);">
                        ✕
                    </button>
                    <div style="font-size:11px; color:#9ca3af; margin-top:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                        ${file.name}
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        });

        fileCountEl.textContent = `${filesArray.length} photo${filesArray.length === 1 ? '' : 's'} sélectionnée${filesArray.length === 1 ? '' : 's'}`;
    }

    function syncFilesToInput() {
        const dt = new DataTransfer();
        filesArray.forEach(file => dt.items.add(file));
        fileInput.files = dt.files;
    }

    // === CLICK TO BROWSE (dropzone background only) ===
    dropzone.addEventListener('click', function (e) {
        if (e.target.closest('label') || e.target.closest('button')) return;
        fileInput.click();
    });

    // === FILE SELECTED ===
    fileInput.addEventListener('change', function () {
        const newFiles = Array.from(fileInput.files).filter(f => f.type.startsWith('image/'));
        if (newFiles.length > 0) {
            filesArray = [...filesArray, ...newFiles].slice(0, 10);
            renderPreviews();
        }
    });

    // === SYNC FILES ON SUBMIT ===
    const form = dropzone.closest('form');
    form.addEventListener('submit', function () {
        syncFilesToInput();
    });

    // === DRAG & DROP ===
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '#ff8138';
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.style.borderColor = '';
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '';
        const newFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (newFiles.length > 0) {
            filesArray = [...filesArray, ...newFiles].slice(0, 10);
            renderPreviews();
        }
    });

    // === REMOVE IMAGE ===
    previewContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-index]');
        if (btn) {
            const index = parseInt(btn.dataset.index);
            filesArray.splice(index, 1);
            renderPreviews();
        }
    });

}