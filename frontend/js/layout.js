/**
 * Renders the sidebar navigation into #sidebar and wires up the
 * logout button. `activePage` should match one of: dashboard, projects, profile.
 */
function renderSidebar(activePage) {
  const user = getCurrentUser() || { name: 'User', email: '' };
  const el = document.getElementById('sidebar');
  if (!el) return;

  el.innerHTML = `
    <div class="brand-mark">
      <span class="logo-dot">⌁</span>
      <span>TaskFlow</span>
    </div>

    <div class="nav-section-label">Menu</div>
    <ul class="nav-list">
      <li><a class="nav-item ${activePage === 'dashboard' ? 'active' : ''}" href="dashboard.html">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>
        <span>Dashboard</span>
      </a></li>
      <li><a class="nav-item ${activePage === 'projects' ? 'active' : ''}" href="projects.html">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>
        <span>Projects</span>
      </a></li>
      <li><a class="nav-item ${activePage === 'profile' ? 'active' : ''}" href="profile.html">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
        <span>Profile</span>
      </a></li>
    </ul>

    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="avatar">${initials(user.name)}</div>
        <div>
          <div class="name">${escapeHtml(user.name)}</div>
          <div class="email">${escapeHtml(user.email)}</div>
        </div>
      </div>
      <button class="logout-btn" id="logoutBtn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        <span>Log Out</span>
      </button>
    </div>
  `;

  document.getElementById('logoutBtn').addEventListener('click', () => {
    clearSession();
    window.location.href = 'login.html';
  });
}

function renderTopbar(title, subtitle, actionsHtml = '') {
  const el = document.getElementById('topbar');
  if (!el) return;
  el.innerHTML = `
    <div>
      <h1>${title}</h1>
      <div class="page-subtitle">${subtitle}</div>
    </div>
    <div class="topbar-actions">${actionsHtml}</div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
