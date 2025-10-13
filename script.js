// Simple client-side login demo
const form = document.getElementById('login-form');
const emailEl = document.getElementById('email');
const passwordEl = document.getElementById('password');
const resultEl = document.getElementById('result');
const toggleBtn = document.getElementById('toggle-password');
const rememberEl = document.getElementById('remember');

// Demo credentials (client-side only for demo). In real apps, authenticate on server.
const DEFAULT_DEMO = { email: 'user@example.com', password: 'password123' };
function getDemo() {
  const stored = localStorage.getItem('demoAccount');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) { /* ignore malformed data */ }
  }
  return DEFAULT_DEMO;
}

// Load remembered email
window.addEventListener('DOMContentLoaded', () => {
  const rem = localStorage.getItem('rememberedEmail');
  if (rem) {
    emailEl.value = rem;
    rememberEl.checked = true;
  }
});

// Toggle password visibility
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

function validate() {
  let ok = true;
  if (!emailEl.value) { showError(emailEl, 'Email is required'); ok = false } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailEl.value)) { showError(emailEl, 'Enter a valid email'); ok = false } else { showError(emailEl, '') }

  if (!passwordEl.value) { showError(passwordEl, 'Password is required'); ok = false } else if (passwordEl.value.length < 6) { showError(passwordEl, 'Password must be at least 6 characters'); ok = false } else { showError(passwordEl, '') }

  return ok;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  resultEl.textContent = '';

  if (!validate()) return;

  // Simulate server latency
  const email = emailEl.value.trim();
  const password = passwordEl.value;

  resultEl.textContent = 'Signing in...';
  resultEl.style.color = '';

  setTimeout(() => {
  const demo = getDemo();
  if (email === demo.email && password === demo.password) {
      resultEl.textContent = 'Signed in — welcome back!';
      resultEl.style.color = 'var(--green)';

      // Remember email if requested
      if (rememberEl.checked) localStorage.setItem('rememberedEmail', email);
      else localStorage.removeItem('rememberedEmail');

      // Redirect or invoke callback - demo shows a small success state
      form.reset();
      setTimeout(() => {
        resultEl.textContent = '';
      }, 1800);
    } else {
      resultEl.textContent = 'Invalid credentials';
      resultEl.style.color = 'var(--danger)';
    }
  }, 700);
});

// Accessibility: submit with Enter from password and email
[emailEl, passwordEl].forEach((el) => {
  el.addEventListener('input', () => { showError(el, '') });
});
