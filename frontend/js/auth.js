// Redirect already-logged-in users straight to the dashboard
if (getToken() && (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html'))) {
  window.location.href = 'dashboard.html';
}

function showFormError(message) {
  const el = document.getElementById('formError');
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
}

function hideFormError() {
  const el = document.getElementById('formError');
  if (!el) return;
  el.classList.remove('visible');
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormError();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    try {
      const data = await api.login({ email, password });
      saveSession(data.token, data.user);
      window.location.href = 'dashboard.html';
    } catch (err) {
      showFormError(err.message);
      submitBtn.textContent = 'Log In';
      submitBtn.disabled = false;
    }
  });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormError();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const submitBtn = registerForm.querySelector('button[type="submit"]');

    if (password !== confirmPassword) {
      showFormError('Passwords do not match.');
      return;
    }

    submitBtn.textContent = 'Creating account...';
    submitBtn.disabled = true;

    try {
      const data = await api.register({ name, email, password, confirmPassword });
      saveSession(data.token, data.user);
      window.location.href = 'dashboard.html';
    } catch (err) {
      showFormError(err.message);
      submitBtn.textContent = 'Create Account';
      submitBtn.disabled = false;
    }
  });
}
