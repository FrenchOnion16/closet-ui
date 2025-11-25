const form = document.getElementById('login-form');
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

window.addEventListener('DOMContentLoaded', () => {
  const rem = localStorage.getItem('rememberedLogin') || localStorage.getItem('rememberedEmail');
  if (rem) {
    emailEl.value = rem;
    rememberEl.checked = true;
  }
});

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

form.addEventListener('submit', (e) => {
  e.preventDefault();
  resultEl.textContent = '';

  if (!validate()) return;

  const login = emailEl.value.trim();
  const password = passwordEl.value;

  resultEl.textContent = 'Signing in...';
  resultEl.style.color = '';
  const submitBtn = document.getElementById('submit');
  if (submitBtn) submitBtn.disabled = true;

  // Call Rails sessions API (login can be email or username)
  fetch('http://localhost:3000/sessions', {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ login, password })
  }).then(async (res) => {
    if (submitBtn) submitBtn.disabled = false;
    if (res.ok) {
      let payload = null;
      try { payload = await res.json(); } catch (e) {}

      resultEl.textContent = 'Signed in — welcome back!';
      resultEl.style.color = 'var(--green)';

  if (rememberEl.checked) localStorage.setItem('rememberedLogin', login);
  else { localStorage.removeItem('rememberedLogin'); localStorage.removeItem('rememberedEmail'); }
      try {
        const session = { email: isEmail(login) ? login : (payload && (payload.email || payload.user?.email)) || login, login, token: payload && (payload.token || payload.jwt || payload.session_token) };
        localStorage.setItem('session', JSON.stringify(session));
      } catch (e) { /* ignore */ }

      // Redirect to home screen
      window.location.href = 'home.html';
      return;
    }

    try {
      const payload = await res.json();
      if (payload && (payload.error || payload.message)) msg = payload.error || payload.message;
    } catch (e) {}
    resultEl.textContent = msg;
    resultEl.style.color = 'var(--danger)';
  }).catch((err) => {
    if (submitBtn) submitBtn.disabled = false;    const demo = getLogin();
    const matchesDemoLogin = (login === demo.email) || (demo.username && login === demo.username);
    if (matchesDemoLogin && password === demo.password) {
      if (rememberEl.checked) localStorage.setItem('rememberedLogin', login);
      else { localStorage.removeItem('rememberedLogin'); localStorage.removeItem('rememberedEmail'); }
      const session = { email: isEmail(login) ? login : demo.email, login };
      localStorage.setItem('session', JSON.stringify(session));
      window.location.href = 'home.html';
    } else {
      resultEl.textContent = 'Invalid credentials';
      resultEl.style.color = 'var(--danger)';
    }
  });
});

[emailEl, passwordEl].forEach((el) => {
  el.addEventListener('input', () => { showError(el, '') });
});
