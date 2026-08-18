requireAuth();
renderSidebar('projects');

const params = new URLSearchParams(window.location.search);
const projectId = params.get('id');

if (!projectId) {
  window.location.href = 'projects.html';
}

let currentProject = null;
let allUsers = [];
let activeTaskId = null;

const statusToColKey = {
  'To Do': 'todo',
  'In Progress': 'inprogress',
  'Review': 'review',
  'Done': 'done'
};

async function init() {
  try {
    const [project, users] = await Promise.all([api.getProject(projectId), api.getUsers()]);
    currentProject = project;
    allUsers = users;

    renderTopbar(
      project.name,
      project.description || 'Manage tasks for this project.',
      `<a class="btn btn-ghost btn-sm" href="projects.html">← All Projects</a>`
    );

    populateAssigneeOptions();
    await loadTasks();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function populateAssigneeOptions() {
  const select = document.getElementById('taskAssignee');
  select.innerHTML = '<option value="">Unassigned</option>' +
    allUsers.map((u) => `<option value="${u._id}">${escapeHtml(u.name)}</option>`).join('');
}

async function loadTasks() {
  try {
    const tasks = await api.getTasks({ project: projectId });

    ['todo', 'inprogress', 'review', 'done'].forEach((key) => {
      document.getElementById(`col-${key}`).innerHTML = '';
    });

    const counts = { todo: 0, inprogress: 0, review: 0, done: 0 };

    tasks.forEach((task) => {
      const key = statusToColKey[task.status];
      counts[key]++;
      const col = document.getElementById(`col-${key}`);
      col.insertAdjacentHTML('beforeend', renderTaskCard(task));
    });

    Object.entries(counts).forEach(([key, count]) => {
      document.getElementById(`count-${key}`).textContent = count;
    });

    document.querySelectorAll('.task-card').forEach((card) => {
      card.addEventListener('click', () => openTaskDetail(card.dataset.id));
    });
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderTaskCard(task) {
  const priorityBadge = { High: 'badge-high', Medium: 'badge-medium', Low: 'badge-low' }[task.priority];
  const priorityClass = { High: 'priority-high', Medium: 'priority-medium', Low: 'priority-low' }[task.priority];

  return `
    <div class="task-card ${priorityClass}" data-id="${task._id}">
      <div class="task-card-title">${escapeHtml(task.title)}</div>
      <div class="task-card-footer">
        <div class="task-card-meta">
          ${task.assignedTo ? `<span class="task-mini-avatar" title="${escapeHtml(task.assignedTo.name)}">${initials(task.assignedTo.name)}</span>` : ''}
          <span>${formatDate(task.dueDate)}</span>
        </div>
        <span class="badge ${priorityBadge}">${task.priority}</span>
      </div>
      <div class="task-card-footer" style="margin-top:8px;">
        <span class="comment-count">💬 ${task.commentCount || 0}</span>
      </div>
    </div>
  `;
}

/* ---------------- Create Task Modal ---------------- */

const taskModalOverlay = document.getElementById('taskModalOverlay');
const taskForm = document.getElementById('taskForm');

document.querySelectorAll('.add-task-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    taskForm.reset();
    document.getElementById('taskStatus').value = btn.dataset.status;
    taskModalOverlay.classList.add('open');
  });
});

document.getElementById('taskModalClose').addEventListener('click', closeTaskModal);
document.getElementById('taskCancelBtn').addEventListener('click', closeTaskModal);
taskModalOverlay.addEventListener('click', (e) => { if (e.target === taskModalOverlay) closeTaskModal(); });

function closeTaskModal() {
  taskModalOverlay.classList.remove('open');
  taskForm.reset();
}

document.getElementById('taskSaveBtn').addEventListener('click', async () => {
  const title = document.getElementById('taskTitle').value.trim();
  if (!title) {
    showToast('Task title is required.', 'error');
    return;
  }

  const payload = {
    title,
    description: document.getElementById('taskDescription').value.trim(),
    project: projectId,
    assignedTo: document.getElementById('taskAssignee').value || null,
    priority: document.getElementById('taskPriority').value,
    status: document.getElementById('taskStatus').value,
    dueDate: document.getElementById('taskDueDate').value || null
  };

  try {
    await api.createTask(payload);
    showToast('Task created successfully.');
    closeTaskModal();
    loadTasks();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

/* ---------------- Task Detail Modal ---------------- */

const detailModalOverlay = document.getElementById('detailModalOverlay');

async function openTaskDetail(taskId) {
  activeTaskId = taskId;
  try {
    const task = await api.getTask(taskId);
    document.getElementById('detailTitle').textContent = task.title;
    document.getElementById('detailDescription').textContent = task.description || 'No description provided.';
    document.getElementById('detailAssignee').textContent = task.assignedTo ? task.assignedTo.name : 'Unassigned';
    document.getElementById('detailPriority').textContent = task.priority;
    document.getElementById('detailDueDate').textContent = formatDate(task.dueDate);
    document.getElementById('detailStatusSelect').value = task.status;

    await loadComments(taskId);

    detailModalOverlay.classList.add('open');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

document.getElementById('detailModalClose').addEventListener('click', closeDetailModal);
detailModalOverlay.addEventListener('click', (e) => { if (e.target === detailModalOverlay) closeDetailModal(); });

function closeDetailModal() {
  detailModalOverlay.classList.remove('open');
  activeTaskId = null;
}

document.getElementById('detailStatusSelect').addEventListener('change', async (e) => {
  try {
    await api.updateTask(activeTaskId, { status: e.target.value });
    showToast('Task status updated.');
    loadTasks();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

document.getElementById('detailDeleteBtn').addEventListener('click', async () => {
  if (!confirm('Delete this task and its comments? This cannot be undone.')) return;
  try {
    await api.deleteTask(activeTaskId);
    showToast('Task deleted.');
    closeDetailModal();
    loadTasks();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

/* ---------------- Comments ---------------- */

async function loadComments(taskId) {
  const currentUser = getCurrentUser();
  const list = document.getElementById('commentsList');

  try {
    const comments = await api.getComments(taskId);

    if (comments.length === 0) {
      list.innerHTML = `<p style="font-size:13px; color:var(--ink-muted);">No comments yet. Be the first to comment.</p>`;
      return;
    }

    list.innerHTML = comments.map((c) => `
      <div class="comment-item">
        <div class="task-mini-avatar" style="width:30px;height:30px;font-size:12px;">${initials(c.user.name)}</div>
        <div class="comment-body">
          <div class="comment-header">
            <span class="comment-author">${escapeHtml(c.user.name)}</span>
            <span class="comment-time">${timeAgo(c.createdAt)}</span>
          </div>
          <div class="comment-text">${escapeHtml(c.text)}</div>
          ${currentUser && c.user._id === currentUser.id ? `<button class="comment-delete" data-id="${c._id}">Delete</button>` : ''}
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.comment-delete').forEach((btn) => {
      btn.addEventListener('click', () => deleteComment(btn.dataset.id));
    });
  } catch (err) {
    showToast(err.message, 'error');
  }
}

document.getElementById('addCommentBtn').addEventListener('click', addComment);
document.getElementById('newCommentInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addComment();
});

async function addComment() {
  const input = document.getElementById('newCommentInput');
  const text = input.value.trim();
  if (!text) return;

  try {
    await api.addComment(activeTaskId, text);
    input.value = '';
    await loadComments(activeTaskId);
    loadTasks();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteComment(commentId) {
  try {
    await api.deleteComment(commentId);
    await loadComments(activeTaskId);
    loadTasks();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

init();
