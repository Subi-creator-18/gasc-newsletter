// ============================================================
// components.js — Reusable UI renderers
// ============================================================

// ── TOAST ──────────────────────────────────────────────────
const Toast = (() => {
  let container;
  const init = () => {
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container-fixed';
      document.body.appendChild(container);
    }
  };
  const show = (message, type = 'info', duration = 3500) => {
    init();
    const icons = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', info: 'bi-info-circle-fill' };
    const el = document.createElement('div');
    el.className = `toast-gasc ${type}`;
    el.innerHTML = `<i class="bi ${icons[type] || icons.info}"></i><span>${message}</span>`;
    container.appendChild(el);
    setTimeout(() => {
      el.style.animation = 'slideOut .3s ease forwards';
      setTimeout(() => el.remove(), 300);
    }, duration);
  };
  return {
    success: (msg) => show(msg, 'success'),
    error:   (msg) => show(msg, 'error'),
    info:    (msg) => show(msg, 'info')
  };
})();

// ── SPINNER ────────────────────────────────────────────────
const Spinner = (() => {
  let el = null;
  const show = (msg = 'Loading...') => {
    if (el) return;
    el = document.createElement('div');
    el.className = 'spinner-overlay';
    el.innerHTML = `<div class="spinner-box">
      <div class="spinner-border text-primary mb-3" role="status"></div>
      <div class="fw-semibold text-navy">${msg}</div>
    </div>`;
    document.body.appendChild(el);
  };
  const hide = () => { if (el) { el.remove(); el = null; } };
  return { show, hide };
})();

// ── STATUS BADGE ────────────────────────────────────────────
const statusBadge = (status) => {
  const map = {
    pending:   ['badge-pending',   'Pending'],
    approved:  ['badge-approved',  'Approved'],
    rejected:  ['badge-rejected',  'Rejected'],
    draft:     ['badge-draft',     'Draft'],
    published: ['badge-published', 'Published']
  };
  const [cls, label] = map[status] || ['badge-draft', status];
  return `<span class="badge rounded-pill ${cls} px-2 py-1">${label}</span>`;
};

// ── CATEGORY BADGE ──────────────────────────────────────────
const categoryBadge = (cat) => {
  const colors = { research: '#6f42c1', event: '#0d6efd', achievement: '#198754', general: '#6c757d' };
  const color = colors[cat] || '#888';
  return `<span class="badge" style="background:${color};font-size:.7rem">${cat.charAt(0).toUpperCase()+cat.slice(1)}</span>`;
};

// ── DATE FORMAT ─────────────────────────────────────────────
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';

// ── SUBMISSION TABLE ROW ─────────────────────────────────────
const submissionRow = (sub, actions = '') => `
  <tr>
    <td><span class="fw-semibold">${escHtml(sub.title)}</span><br>
        <small class="text-muted">${escHtml(sub.staff_id?.name || '—')}</small></td>
    <td><span class="submission-review-card__dept-tag">${escHtml(sub.department_id?.name || '—')}</span></td>
    <td>${categoryBadge(sub.category)}</td>
    <td>${statusBadge(sub.status)}</td>
    <td class="text-muted small">${fmtDate(sub.createdAt)}</td>
    <td>${actions}</td>
  </tr>`;

// ── SUBMISSION REVIEW CARD ───────────────────────────────────
const submissionCard = (sub, actions = '') => `
  <div class="submission-review-card">
    <div class="p-3 border-bottom d-flex justify-content-between align-items-start flex-wrap gap-2">
      <div>
        <span class="card-dept-tag me-1">${escHtml(sub.department_id?.name || '—')}</span>
        ${categoryBadge(sub.category)}
        <h6 class="mt-2 mb-0 fw-bold">${escHtml(sub.title)}</h6>
        <small class="text-muted">By ${escHtml(sub.staff_id?.name || '—')} • ${fmtDate(sub.createdAt)}</small>
      </div>
      <div class="d-flex gap-2 align-items-center">
        ${statusBadge(sub.status)}
        ${actions}
      </div>
    </div>
    <div class="p-3">
      <p class="mb-2" style="font-size:.9rem;white-space:pre-wrap">${escHtml(sub.content)}</p>
      ${sub.photos?.length ? renderPhotoPreview(sub.photos) : ''}
      ${sub.rejection_comment ? `<div class="alert-gasc-error mt-2 small"><strong>Rejection comment:</strong> ${escHtml(sub.rejection_comment)}</div>` : ''}
    </div>
  </div>`;

// ── PHOTO PREVIEW (review/my submissions) ───────────────────
const renderPhotoPreview = (photos) => {
  const count = Math.min(photos.length, 4);
  const colMap = { 1:'col-12', 2:'col-6', 3:'col-4', 4:'col-3' };
  const col = colMap[count];
  return `<div class="row g-1 mt-1">
    ${photos.slice(0, 4).map(p => `
      <div class="${col}">
        <img src="${p.url}" class="img-fluid rounded" style="width:100%;height:120px;object-fit:cover" alt="photo">
      </div>`).join('')}
  </div>`;
};

// ── SIDEBAR INIT ─────────────────────────────────────────────
const initSidebar = () => {
  const user = Auth.getUser();
  if (!user) return;

  // Set user info
  const nameEl = document.getElementById('sidebar-user-name');
  const roleEl = document.getElementById('sidebar-user-role');
  const deptEl = document.getElementById('sidebar-user-dept');
  if (nameEl) nameEl.textContent = user.name || '';
  if (roleEl) roleEl.textContent = user.role === 'principal' ? 'Principal' : 'Staff';
  if (deptEl) deptEl.textContent = user.department_id?.name || '';

  // Show/hide role-based links
  document.querySelectorAll('[data-role]').forEach(el => {
    const roles = el.dataset.role.split(',').map(r => r.trim());
    el.style.display = roles.includes(user.role) ? '' : 'none';
  });

  // Active link
  const page = window.location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.sidebar-link').forEach(link => {
    if (link.getAttribute('href') === page) link.classList.add('active');
  });

  // Mobile toggle
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

  // Logout
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); Auth.logout(); });
  });
};

// ── ESCAPE HTML ─────────────────────────────────────────────
const escHtml = (str) => {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
};

// ── CONFIRM DIALOG ──────────────────────────────────────────
const confirmAction = (message) => window.confirm(message);

// ── EMPTY STATE ─────────────────────────────────────────────
const emptyState = (message, icon = 'bi-inbox') => `
  <div class="text-center py-5 text-muted">
    <i class="bi ${icon}" style="font-size:3rem;opacity:.3"></i>
    <p class="mt-3 mb-0">${message}</p>
  </div>`;

// ── PAGINATION ──────────────────────────────────────────────
const renderPagination = (containerId, total, limit, currentPage, onPageChange) => {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) { document.getElementById(containerId).innerHTML = ''; return; }
  let html = '<nav><ul class="pagination pagination-sm mb-0">';
  for (let i = 1; i <= totalPages; i++) {
    html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
      <button class="page-link" onclick="(${onPageChange.toString()})(${i})">${i}</button></li>`;
  }
  html += '</ul></nav>';
  document.getElementById(containerId).innerHTML = html;
};
