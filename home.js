// Home page script: show the logged-in member's username

(function () {
	const welcomeEl = document.getElementById('welcome');
	const logoutBtn = document.getElementById('logout');

	function isEmail(value) {
		return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
	}

	function getSession() {
		const raw = localStorage.getItem('session');
		if (!raw) return null;
		try { return JSON.parse(raw); } catch (_) { return null; }
	}

	function deriveDisplayName(session) {
		if (!session || typeof session !== 'object') return null;
		if (session.username && typeof session.username === 'string') return session.username;
		if (session.user && typeof session.user.username === 'string') return session.user.username;
		if (session.login && !isEmail(session.login)) return session.login;
		if (session.email && typeof session.email === 'string') {
			const at = session.email.indexOf('@');
			return at > 0 ? session.email.slice(0, at) : session.email;
		}
		return session.login || null;
	}

	function showWelcome() {
		if (!welcomeEl) return;
		const session = getSession();
		const name = deriveDisplayName(session) || 'there';
		welcomeEl.textContent = `Welcome, ${name}!`;
	}

	function setupLogout() {
		if (!logoutBtn) return;
		logoutBtn.addEventListener('click', () => {
			try { localStorage.removeItem('session'); } catch (_) {}
			window.location.href = 'index.html';
		});
	}

	showWelcome();
	setupLogout();
})();

