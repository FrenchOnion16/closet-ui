
const form = document.getElementById('signup-form');
const usernameEl = document.getElementById('username');
const emailEl = document.getElementById('email');
const ageEl = document.getElementById('age');
const genderEl = document.getElementById('gender');
const passwordEl = document.getElementById('password');
const confirmEl = document.getElementById('confirm');
const resultEl = document.getElementById('result');

function showError(inputEl, msg) {
  const id = inputEl.id + '-error';
  const el = document.getElementById(id);
  el.textContent = msg || '';
  if (msg) {
    inputEl.setAttribute('aria-invalid', 'true');
    inputEl.classList.add('input-error');
  } else {
    inputEl.removeAttribute('aria-invalid');
    inputEl.classList.remove('input-error');
  }
}

function validate() {
  let ok = true;
  const usernameVal = usernameEl.value.trim();
  if (!usernameVal) {
    showError(usernameEl, 'Username is required');
    ok = false;
  } else if (usernameVal.length < 3 || usernameVal.length > 20) {
    showError(usernameEl, 'Username must be between 3 and 20 characters');
    ok = false;
  } else {
    showError(usernameEl, '');
  }
  if (!emailEl.value) { showError(emailEl, 'Email is required'); ok = false } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailEl.value)) { showError(emailEl, 'Enter a valid email'); ok = false } else { showError(emailEl, '') }

  const ageVal = Number(ageEl.value);
  if (!ageEl.value || Number.isNaN(ageVal)) {
    showError(ageEl, 'Enter a valid age');
    ok = false;
  } else if (ageVal < 13) {
    showError(ageEl, 'You must be at least 13 years old');
    ok = false;
  } else if (ageVal > 120) {
    showError(ageEl, 'Age must be 120 or lower');
    ok = false;
  } else {
    showError(ageEl, '');
  }

  if (!genderEl.value) { showError(genderEl, 'Select a gender'); ok = false } else { showError(genderEl, '') }

  if (!passwordEl.value) { showError(passwordEl, 'Password is required'); ok = false } else if (passwordEl.value.length < 6) { showError(passwordEl, 'Password must be at least 6 characters'); ok = false } else { showError(passwordEl, '') }
  if (confirmEl.value !== passwordEl.value) { showError(confirmEl, 'Passwords do not match'); ok = false } else { showError(confirmEl, '') }
  return ok;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  resultEl.textContent = '';

  if (!validate()) return;

  const account = {
    username: usernameEl.value.trim(),
    email: emailEl.value.trim(),
    age: Number(ageEl.value),
    gender: genderEl.value,
    password: passwordEl.value
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  resultEl.textContent = 'Creating account...';

  fetch('http://127.0.0.1:3000/users', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ user: account })
  }).then(async (res) => {
    submitBtn.disabled = false;
    if (res.ok) {
      resultEl.textContent = 'Account created — redirecting to sign in';
      resultEl.style.color = 'var(--green)';
      localStorage.setItem('rememberedEmail', account.email);
      setTimeout(() => { window.location.href = 'index.html'; }, 900);
      return;
    }

    let payload;
    try { payload = await res.json(); } catch (e) { payload = null }
    if (res.status === 422 && payload && Array.isArray(payload.errors)) {
      const rawMessages = payload.errors.map(m => String(m).trim()).filter(Boolean);
      rawMessages.forEach(msg => {
        const fieldName = msg.split(/\s+/)[0].toLowerCase();
        let targetEl = null;
        switch (fieldName) {
          case 'username': targetEl = usernameEl; break;
          case 'email': targetEl = emailEl; break;
          case 'password': targetEl = passwordEl; break;
          case 'age': targetEl = ageEl; break;
          case 'gender': targetEl = genderEl; break;
          default: targetEl = null;
        }
        if (targetEl) {
          showError(targetEl, msg);
        }
      });
      const unique = [...new Set(rawMessages)];
        // Escape < & to avoid HTML injection, then build list items
        const listHtml = '<ul class="error-list" style="margin:8px 0 0;padding-left:20px;color:var(--danger);">' +
          unique.map(m => '<li>' + m.replace(/[<&]/g, c => c === '<' ? '&lt;' : '&amp;') + '</li>').join('') + '</ul>';
        resultEl.innerHTML = listHtml;
      resultEl.style.color = 'var(--danger)';
      return;
    }
  }).catch((err) => {
    submitBtn.disabled = false;
    resultEl.textContent = 'Network error';
    resultEl.style.color = 'var(--muted)';
    try { localStorage.setItem('makeAccount', JSON.stringify(account)); } catch (e) { /* ignore */ }
  });
});

[usernameEl, emailEl, ageEl, genderEl, passwordEl, confirmEl].forEach((el) => {
  if (!el) return;
  el.addEventListener('input', () => showError(el, ''));
});
