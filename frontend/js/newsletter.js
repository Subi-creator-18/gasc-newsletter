// ============================================================
// newsletter.js — Newsletter template population + PDF export
// ============================================================

const Newsletter = (() => {

  // ── RENDER FULL NEWSLETTER HTML ─────────────────────────
  const render = (data) => {
    const { volume, collegeInfo, sections } = data;
    const ci = collegeInfo || {};

    return `
      ${renderCoverPage(volume, ci)}
      ${renderContentPages(sections)}
    `;
  };

  // ── PAGE 1: COVER PAGE ──────────────────────────────────
  const renderCoverPage = (volume, ci) => `
    <div class="nl-page" id="nl-cover">
      <!-- Header -->
      <div class="nl-header">
        <div class="d-flex align-items-start gap-3">
          ${ci.logo_url ? `<img src="${ci.logo_url}" style="width:80px;height:80px;object-fit:contain" alt="logo">` : ''}
          <div class="flex-1">
            <div class="nl-college-name">NEWSLETTER<br>${ci.college_name || 'Gobi Arts & Science College'}</div>
            <div class="nl-accreditation mt-1">
              ${ci.accreditation || ''}<br>
              ${ci.address || ''} &nbsp;|&nbsp; Email: ${ci.email || ''}<br>
              Website: ${ci.website || ''} &nbsp;|&nbsp; Phone: ${ci.phone || ''}
            </div>
          </div>
        </div>
      </div>

      <!-- Volume Banner -->
      <div class="nl-vol-banner">
        Volume : ${volume.volume_no} &nbsp;&nbsp;|&nbsp;&nbsp;
        ${volume.period_label} &nbsp;&nbsp;|&nbsp;&nbsp;
        No : ${volume.issue_no}
      </div>

      <!-- Principal Section -->
      <div class="nl-principal-section">
        ${ci.principal_photo_url
          ? `<img src="${ci.principal_photo_url}" class="nl-principal-photo" alt="${ci.principal_name}">`
          : `<div class="nl-principal-photo d-flex align-items-center justify-content-center bg-light text-muted" style="font-size:.7rem;text-align:center">Principal<br>Photo</div>`}
        <div>
          <div class="nl-section-heading" style="margin-top:0">Dear Gascian,</div>
          <div class="nl-principal-message">${volume.principal_message || '<em>Principal\'s message will appear here.</em>'}</div>
          <div class="text-end mt-2" style="font-size:.8rem;font-style:italic">
            With Regards,<br>
            <strong>${ci.principal_name || 'Principal'}</strong><br>
            <small>Principal</small>
          </div>
        </div>
      </div>

      <!-- Vision & Mission -->
      <div class="nl-vision-mission">
        <strong>Our Vision:</strong><br>
        "${ci.vision || ''}"
        <br><br>
        <strong>Our Mission:</strong><br>
        "${ci.mission || ''}"
      </div>

      <!-- Editorial Board -->
      ${renderEditorialBoard(ci.editorial_board)}

      <div class="nl-footer">
        News items published in this Newsletter are based on inputs received from individuals / Departments / Forums concerned.
      </div>
      <div class="nl-for-private">FOR PRIVATE CIRCULATION ONLY &nbsp;|&nbsp; ${volume.period_label} &nbsp;|&nbsp; Vol.${volume.volume_no}, No.${volume.issue_no}</div>
    </div>`;

  // ── EDITORIAL BOARD TABLE ────────────────────────────────
  const renderEditorialBoard = (board) => {
    if (!board || board.length === 0) return '';
    return `
      <div class="mt-2">
        <div class="nl-section-heading" style="font-size:.8rem">Editorial Board</div>
        <table class="nl-editorial-table">
          ${board.map(m => `<tr><td>${escHtml(m.name)}</td><td style="color:#666">${escHtml(m.role)}</td></tr>`).join('')}
        </table>
      </div>`;
  };

  // ── CONTENT PAGES ───────────────────────────────────────
  const renderContentPages = (sections) => {
    if (!sections || sections.length === 0) return `
      <div class="nl-page">
        <div class="text-center text-muted py-5">No approved submissions in this volume yet.</div>
      </div>`;

    // Group sections by department type
    const aided    = sections.filter(s => s.department?.type === 'aided');
    const unaided  = sections.filter(s => s.department?.type === 'unaided');
    const forums   = sections.filter(s => s.department?.type === 'forum');

    return `
      <div class="nl-page">
        ${aided.length   ? `<div class="nl-section-heading">Aided Departments</div>${aided.map(renderDeptSection).join('')}`   : ''}
        ${unaided.length ? `<div class="nl-section-heading">Unaided Departments</div>${unaided.map(renderDeptSection).join('')}` : ''}
        ${forums.length  ? `<div class="nl-section-heading">Forums & Other Activities</div>${forums.map(renderDeptSection).join('')}` : ''}
        <div class="nl-footer">Newsletter &nbsp;|&nbsp; GASC</div>
      </div>`;
  };

  // ── SINGLE DEPT SECTION ──────────────────────────────────
  const renderDeptSection = (section) => {
    const dept = section.department;
    const subs = section.submissions || [];
    return `
      <div class="nl-dept-heading">${escHtml(dept?.name || 'Department')}</div>
      ${subs.map(renderSubmissionItem).join('')}`;
  };

  // ── SINGLE SUBMISSION ITEM ───────────────────────────────
  const renderSubmissionItem = (sub) => `
    <div class="nl-item">
      <span class="nl-item-title">➤ </span>${escHtml(sub.content)}
      ${sub.photos?.length ? PhotoGrid.renderNewsletterGrid(sub.photos) : ''}
    </div>`;

  // ── PDF EXPORT ───────────────────────────────────────────
  const exportPDF = () => {
    window.print();
  };

  // ── ESCAPE HTML ─────────────────────────────────────────
  const escHtml = (str) => {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  };

  return { render, exportPDF };
})();
