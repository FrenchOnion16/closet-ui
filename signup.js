// Signup page behavior: validate and store a demo account in localStorage
const form = document.getElementById('signup-form');
const nameEl = document.getElementById('name');
const emailEl = document.getElementById('email');
const passwordEl = document.getElementById('password');
const confirmEl = document.getElementById('confirm');
const resultEl = document.getElementById('result');

function showError(inputEl, msg) {
  const id = inputEl.id + '-error';
  const el = document.getElementById(id);
  el.textContent = msg || '';
}

function validate() {
  let ok = true;
  if (!nameEl.value.trim()) { showError(nameEl, 'Name is required'); ok = false } else { showError(nameEl, '') }
  if (!emailEl.value) { showError(emailEl, 'Email is required'); ok = false } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailEl.value)) { showError(emailEl, 'Enter a valid email'); ok = false } else { showError(emailEl, '') }
  if (!passwordEl.value) { showError(passwordEl, 'Password is required'); ok = false } else if (passwordEl.value.length < 6) { showError(passwordEl, 'Password must be at least 6 characters'); ok = false } else { showError(passwordEl, '') }
  if (confirmEl.value !== passwordEl.value) { showError(confirmEl, 'Passwords do not match'); ok = false } else { showError(confirmEl, '') }
  return ok;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  resultEl.textContent = '';

  if (!validate()) return;

  const account = { name: nameEl.value.trim(), email: emailEl.value.trim(), password: passwordEl.value };

  resultEl.textContent = 'Creating account...';

  setTimeout(() => {
    // Save account to localStorage (demo only)
    try {
      localStorage.setItem('demoAccount', JSON.stringify(account));
      resultEl.textContent = 'Account created — redirecting to sign in';
      resultEl.style.color = 'var(--green)';
      setTimeout(() => { window.location.href = 'index.html'; }, 900);
    } catch (err) {
      resultEl.textContent = 'Could not create account';
      resultEl.style.color = 'var(--danger)';
    }
  }, 700);
});
