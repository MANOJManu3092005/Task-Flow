requireAuth();

const user = getCurrentUser();
renderSidebar('dashboard');
renderTopbar(`Welcome back, ${user ? user.name.split(' ')[0] : ''} 👋`, "Here's what's happening across your projects.");

async function loadDashboard() {
  try {
    const [projects, tasks] = await Promise.all([api.getProjects(), api.getTasks()]);

    document.getElementById('statProjects').textContent = projects.length;
    document.getElementById('statTasks').textContent = tasks.length;

    const pending = tasks.filter((t) => t.status !== 'Done').length;
    const completed = tasks.filter((t) => t.status === 'Done').length;
    document.getElementById('statPending').textContent = pending;
    document.getElementById('statCompleted').textContent = completed;

    renderRecentProjects(projects.slice(0, 4));
    renderRecentTasks(tasks.slice(0, 5));
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderRecentProjects(projects) {
  const container = document.getElementById('recentProjects');

  if (projects.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📁</div>
        <p>No projects yet. Create your first project to get started.</p>
        <a class="btn btn-primary btn-sm" href="projects.html">+ Create Project</a>
      </div>`;
    return;
  }

  container.innerHTML = projects.map((p) => `
    <a class="recent-project-row" href="project.html?id=${p._id}">
      <div class="mini-icon">${p.name.slice(0, 2).toUpperCase()}</div>
      <div style="flex:1; min-width:0;">
        <div class="row-title">${escapeHtml(p.name)}</div>
        <div class="row-sub">${p.taskCount} task${p.taskCount === 1 ? '' : 's'} · ${p.progress}% complete</div>
      </div>
    </a>
  `).join('');
}

function renderRecentTasks(tasks) {
  const container = document.getElementById('recentTasks');

  if (tasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✅</div>
        <p>No tasks yet. Open a project board to add one.</p>
      </div>`;
    return;
  }

  const priorityClass = { High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' };

  container.innerHTML = tasks.map((t) => `
    <a class="recent-task-row" href="project.html?id=${t.project?._id || ''}">
      <div class="mini-icon" style="background:${statusColor(t.status)}">${t.status[0]}</div>
      <div style="flex:1; min-width:0;">
        <div class="row-title">${escapeHtml(t.title)}</div>
        <div class="row-sub">${escapeHtml(t.project?.name || '')} · ${t.status}</div>
      </div>
      <span class="badge ${priorityClass[t.priority]}">${t.priority}</span>
    </a>
  `).join('');
}

function statusColor(status) {
  const map = {
    'To Do': 'linear-gradient(135deg, #9799B5, #6B6E8C)',
    'In Progress': 'linear-gradient(135deg, #5B5FEF, #9B6BF2)',
    'Review': 'linear-gradient(135deg, #F5A623, #F0596B)',
    'Done': 'linear-gradient(135deg, #1FB6A6, #5B5FEF)'
  };
  return map[status] || map['To Do'];
}

loadDashboard();
