requireAuth();

renderSidebar('projects');
renderTopbar(
  'Projects',
  'All the projects you own or collaborate on.',
  `<button class="btn btn-primary" id="newProjectBtn">+ Create Project</button>`
);

const overlay = document.getElementById('projectModalOverlay');
const projectForm = document.getElementById('projectForm');

function openProjectModal(project = null) {
  document.getElementById('projectModalTitle').textContent = project ? 'Edit Project' : 'Create Project';
  document.getElementById('projectId').value = project ? project._id : '';
  document.getElementById('projectName').value = project ? project.name : '';
  document.getElementById('projectDescription').value = project ? project.description : '';
  document.getElementById('projectDueDate').value = project && project.dueDate ? project.dueDate.slice(0, 10) : '';
  overlay.classList.add('open');
}

function closeProjectModal() {
  overlay.classList.remove('open');
  projectForm.reset();
}

document.addEventListener('click', (e) => {
  if (e.target.id === 'newProjectBtn') openProjectModal();
});
document.getElementById('projectModalClose').addEventListener('click', closeProjectModal);
document.getElementById('projectCancelBtn').addEventListener('click', closeProjectModal);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeProjectModal(); });

document.getElementById('projectSaveBtn').addEventListener('click', async () => {
  const id = document.getElementById('projectId').value;
  const payload = {
    name: document.getElementById('projectName').value.trim(),
    description: document.getElementById('projectDescription').value.trim(),
    dueDate: document.getElementById('projectDueDate').value || null
  };

  if (!payload.name) {
    showToast('Project name is required.', 'error');
    return;
  }

  try {
    if (id) {
      await api.updateProject(id, payload);
      showToast('Project updated successfully.');
    } else {
      await api.createProject(payload);
      showToast('Project created successfully.');
    }
    closeProjectModal();
    loadProjects();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

async function loadProjects() {
  const grid = document.getElementById('projectGrid');
  try {
    const projects = await api.getProjects();

    if (projects.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">📁</div>
          <p>You don't have any projects yet.</p>
          <button class="btn btn-primary btn-sm" id="emptyCreateBtn">+ Create Project</button>
        </div>`;
      document.getElementById('emptyCreateBtn').addEventListener('click', () => openProjectModal());
      return;
    }

    grid.innerHTML = projects.map((p) => `
      <div class="project-card">
        <div class="project-card-top">
          <div>
            <h4>${escapeHtml(p.name)}</h4>
          </div>
        </div>
        <p class="desc">${escapeHtml(p.description || 'No description provided.')}</p>
        <div class="progress-track"><div class="progress-fill" style="width:${p.progress}%"></div></div>
        <div class="project-meta">
          <span>${p.taskCount} task${p.taskCount === 1 ? '' : 's'}</span>
          <span>${p.progress}% complete</span>
          <span>Due ${formatDate(p.dueDate)}</span>
        </div>
        <div class="project-card-actions">
          <a class="btn btn-primary btn-sm" href="project.html?id=${p._id}">Open</a>
          <button class="btn btn-ghost btn-sm" onclick='editProject(${JSON.stringify(p).replace(/'/g, "&apos;")})'>Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteProject('${p._id}')">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function editProject(project) {
  openProjectModal(project);
}

async function deleteProject(id) {
  if (!confirm('Delete this project and all of its tasks? This cannot be undone.')) return;
  try {
    await api.deleteProject(id);
    showToast('Project deleted.');
    loadProjects();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

loadProjects();
