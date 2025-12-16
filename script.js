const form = document.getElementById('login-form');
if (!form) {
  console.error('[login] Form with id "login-form" not found. Aborting script.');
}
const emailEl = document.getElementById('email');
const passwordEl = document.getElementById('password');
const resultEl = document.getElementById('result');
const toggleBtn = document.getElementById('toggle-password');
const rememberEl = document.getElementById('remember');

const DEFAULT_LOGIN = { email: 'user@example.com', username: 'user', password: 'password123' };
function getLogin() {
  const stored = localStorage.getItem('loginAccount');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) { /* ignore malformed data */ }
  }
  return DEFAULT_LOGIN;
}

toggleBtn.addEventListener('click', () => {
  const shown = passwordEl.type === 'text';
  passwordEl.type = shown ? 'password' : 'text';
  toggleBtn.setAttribute('aria-pressed', String(!shown));
  toggleBtn.textContent = shown ? '👁️' : '🙈';
});

function showError(inputEl, msg) {
  const id = inputEl.id + '-error';
  const el = document.getElementById(id);
  el.textContent = msg || '';
}

function isEmail(value) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
}

function validate() {
  let ok = true;
  const loginVal = emailEl.value.trim();
  if (!loginVal) {
    showError(emailEl, 'Email or username is required');
    ok = false;
  } else if (isEmail(loginVal)) {
    showError(emailEl, '');
  } else if (loginVal.length < 3 || loginVal.length > 20) {
    showError(emailEl, 'Username must be between 3 and 20 characters');
    ok = false;
  } else {
    showError(emailEl, '');
  }

  if (!passwordEl.value) { showError(passwordEl, 'Password is required'); ok = false } else if (passwordEl.value.length < 6) { showError(passwordEl, 'Password must be at least 6 characters'); ok = false } else { showError(passwordEl, '') }

  return ok;
}

if (form) form.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('[login] Submit intercepted');
  resultEl.textContent = '';

  if (!validate()) {
    console.log('[login] Validation failed; aborting fetch');
    return;
  }

  console.log('[login] Validation passed');

  const login = emailEl.value.trim();
  const password = passwordEl.value;

  resultEl.textContent = 'Signing in...';
  resultEl.style.color = '';
  const submitBtn = document.getElementById('submit');
  if (submitBtn) submitBtn.disabled = true;

  console.log('[login] Preparing fetch to /sessions');
  const startedAt = performance.now();
  fetch('http://127.0.0.1:3000/sessions', {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ login, password })
  }).then(async (res) => {
    console.log('[login] Fetch response received', { status: res.status });
    if (submitBtn) submitBtn.disabled = false;
    if (res.ok) {
      let payload = null;
      try { payload = await res.json(); } catch (e) {}

      resultEl.textContent = 'Signed in — welcome back!';
      resultEl.style.color = 'var(--green)';
      try {
        const session = { email: isEmail(login) ? login : (payload && (payload.email || payload.user?.email)) || login, login, token: payload && (payload.token || payload.jwt || payload.session_token) };
        localStorage.setItem('session', JSON.stringify(session));
      } catch (e) { /* ignore */ }

      window.location.href = 'home.html';
      return;
    }

    let msg = 'Sign in failed';
    try {
      const payload = await res.json();
      if (payload) {
        if (Array.isArray(payload.errors) && payload.errors.length) {
          msg = payload.errors.join(', ');
        } else if (typeof payload.error === 'string' && payload.error) {
          msg = payload.error;
        } else if (typeof payload.message === 'string' && payload.message) {
          msg = payload.message;
        }
      }
    } catch (e) { /* ignore JSON parse errors for non-JSON responses */ }
    resultEl.textContent = msg;
    resultEl.style.color = 'var(--danger)';
    console.log('[login] Non-OK response handled in', (performance.now() - startedAt).toFixed(1) + 'ms');
  }).catch((err) => {
    console.error('Login request failed', err);
    if (submitBtn) submitBtn.disabled = false;
    resultEl.textContent = 'Network error occurred. Please try again later.';
    resultEl.style.color = 'var(--danger)';
  }).finally(() => {
    console.log('[login] Fetch chain completed in', (performance.now() - startedAt).toFixed(1) + 'ms');
  });
});

[emailEl, passwordEl].forEach((el) => {
  el.addEventListener('input', () => { showError(el, '') });
});
