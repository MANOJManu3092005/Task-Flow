requireAuth();
renderSidebar('profile');
renderTopbar('Profile', 'View and update your account details.');

async function loadProfile() {
  try {
    const profile = await api.getProfile();

    document.getElementById('profileAvatar').textContent = initials(profile.name);
    document.getElementById('profileName').textContent = profile.name;
    document.getElementById('profileEmail').textContent = profile.email;
    document.getElementById('profileProjectCount').textContent = profile.projectCount;
    document.getElementById('profileTaskCount').textContent = profile.taskCount;

    document.getElementById('editName').value = profile.name;
    document.getElementById('editEmail').value = profile.email;
  } catch (err) {
    showToast(err.message, 'error');
  }
}

document.getElementById('profileForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('editName').value.trim();
  const email = document.getElementById('editEmail').value.trim();

  try {
    const updated = await api.updateProfile({ name, email });
    const user = getCurrentUser();
    saveSession(getToken(), { ...user, name: updated.name, email: updated.email });
    showToast('Profile updated successfully.');
    renderSidebar('profile');
    loadProfile();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

loadProfile();
