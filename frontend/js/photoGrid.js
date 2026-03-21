// ============================================================
// photoGrid.js — Photo grid logic: 1→100%, 2→50%, 3→33%, 4→25%
// Used in: submission form preview, review cards, newsletter render
// ============================================================

const PhotoGrid = (() => {
  const MAX_PHOTOS = 4;
  let selectedFiles = [];

  // ── NEWSLETTER RENDER GRID (for newsletter preview page) ──
  const renderNewsletterGrid = (photos) => {
    if (!photos || photos.length === 0) return '';
    const count = Math.min(photos.length, MAX_PHOTOS);
    const gridClass = `g${count}`;
    return `<div class="nl-photo-grid ${gridClass}">
      ${photos.slice(0, MAX_PHOTOS).map(p =>
        `<img src="${p.url}" alt="event photo" loading="lazy">`
      ).join('')}
    </div>`;
  };

  // ── UPLOAD ZONE INIT (for submission form) ──────────────
  const initUploadZone = (zoneId, inputId, previewId) => {
    const zone  = document.getElementById(zoneId);
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!zone || !input || !preview) return;

    selectedFiles = [];

    // Click zone → trigger file input
    zone.addEventListener('click', () => input.click());

    // Drag & Drop
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', ()  => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      handleFiles(Array.from(e.dataTransfer.files), previewId);
    });

    // File input change
    input.addEventListener('change', () => {
      handleFiles(Array.from(input.files), previewId);
      input.value = ''; // reset so same file can be re-selected
    });
  };

  const handleFiles = (files, previewId) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const remaining = MAX_PHOTOS - selectedFiles.length;
    if (remaining <= 0) { Toast.error(`Maximum ${MAX_PHOTOS} photos allowed`); return; }
    const toAdd = imageFiles.slice(0, remaining);
    if (imageFiles.length > remaining) Toast.info(`Only ${remaining} more photo(s) can be added`);
    selectedFiles.push(...toAdd);
    renderPreview(previewId);
  };

  const renderPreview = (previewId) => {
    const preview = document.getElementById(previewId);
    if (!preview) return;

    if (selectedFiles.length === 0) {
      preview.innerHTML = '';
      preview.className = 'photo-preview-grid';
      return;
    }

    const count = selectedFiles.length;
    preview.className = `photo-preview-grid count-${count}`;
    preview.innerHTML = selectedFiles.map((file, i) => {
      const url = URL.createObjectURL(file);
      return `<div class="photo-preview-item">
        <img src="${url}" alt="preview ${i+1}">
        <button type="button" class="photo-remove-btn" onclick="PhotoGrid.removeFile(${i}, '${previewId}')">
          <i class="bi bi-x"></i>
        </button>
      </div>`;
    }).join('');
  };

  const removeFile = (index, previewId) => {
    URL.revokeObjectURL(document.querySelectorAll('.photo-preview-item img')[index]?.src);
    selectedFiles.splice(index, 1);
    renderPreview(previewId);
  };

  const getFiles = () => selectedFiles;

  const reset = (previewId) => {
    selectedFiles = [];
    renderPreview(previewId);
  };

  // Build FormData with all selected files
  const buildFormData = (fields) => {
    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v); });
    selectedFiles.forEach(f => fd.append('photos', f));
    return fd;
  };

  return { initUploadZone, removeFile, getFiles, reset, buildFormData, renderNewsletterGrid };
})();
