
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-upload');
const previewContainer = document.getElementById('image-preview');
const fileCountEl = document.getElementById('file-count');

if (dropzone && fileInput) {

    let filesArray = [];

    function renderPreviews() {
        previewContainer.innerHTML = '';
        filesArray.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                const div = document.createElement('div');
                div.className = 'relative group';
                div.innerHTML = `
                    <img src="${e.target.result}" 
                        class="w-full aspect-square object-cover rounded-2xl shadow-sm border border-gray-200">
                    <button type="button" 
                            data-index="${index}"
                            class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shadow transition-all opacity-0 group-hover:opacity-100">
                        ✕
                    </button>
                    <div class="text-xs text-gray-500 mt-1 truncate">${file.name}</div>
                `;
                previewContainer.appendChild(div);
            };
            reader.readAsDataURL(file);
        });

        fileCountEl.textContent = `${filesArray.length} file${filesArray.length === 1 ? '' : 's'} selected`;
    }

    function syncFilesToInput() {
        const dt = new DataTransfer();
        filesArray.forEach(file => dt.items.add(file));
        fileInput.files = dt.files;
    }

    // === CLICK TO BROWSE ===
    // Only trigger manually if the click was OUTSIDE the label
    // (clicks on the label already open the dialog natively)
    dropzone.addEventListener('click', function (e) {
        if (e.target.closest('label')) return;
        fileInput.click();
    });

    // === SYNC FILES ON SUBMIT ===
    const form = dropzone.closest('form');
    form.addEventListener('submit', function () {
        syncFilesToInput();
    });

    // === FILE SELECTED ===
    fileInput.addEventListener('change', function (e) {
        const newFiles = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));

        if (newFiles.length > 0) {
            filesArray = [...filesArray, ...newFiles].slice(0, 10);
            renderPreviews();
        }

        setTimeout(() => { fileInput.value = ''; }, 0);
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
        filesArray = [...filesArray, ...newFiles].slice(0, 10);
        renderPreviews();
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