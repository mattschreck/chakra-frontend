// js/auth.js
document.addEventListener('DOMContentLoaded', () => {
  const BACKEND_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://chakra-backend-3783b443f623.herokuapp.com';

  // --- Registrierung ---
  const regForm = document.getElementById('register-form');
  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value.trim();
      const resultEl = document.getElementById('reg-result');

      try {
        const response = await fetch(`${BACKEND_URL}/api/users/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await response.json();
        if (data.success) {
          resultEl.textContent = "Registrierung erfolgreich!";
          resultEl.style.color = "green";
          setTimeout(() => {
            window.location.href = "index.html";
          }, 1000);
        } else {
          resultEl.textContent = `Fehler: ${data.message}`;
          resultEl.style.color = "red";
        }
      } catch (error) {
        resultEl.textContent = `Server-Fehler: ${error}`;
        resultEl.style.color = "red";
      }
    });
  }

  // --- Login ---
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value.trim();
      const resultEl = document.getElementById('login-result');

      try {
        const response = await fetch(`${BACKEND_URL}/api/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.success) {
          resultEl.textContent = "Login erfolgreich!";
          resultEl.style.color = "green";

          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userId', data.userId);
          if (data.name) {
            localStorage.setItem('userName', data.name);
          }
          if (data.email) {
            localStorage.setItem('userEmail', data.email);
          }

          setTimeout(() => {
            window.location.href = "index.html";
          }, 1000);
        } else {
          resultEl.textContent = `Fehler: ${data.message}`;
          resultEl.style.color = "red";
        }
      } catch (error) {
        resultEl.textContent = `Server-Fehler: ${error}`;
        resultEl.style.color = "red";
      }
    });
  }

  // --- Account-Seite (Anzeigen der Daten) ---
  const accountInfo = document.getElementById('account-info');
  if (accountInfo) {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');

    if (!token || !userId) {
      // Nicht eingeloggt -> zurück zur Startseite
      window.location.href = "index.html";
    } else {
      // Zeige Name und E-Mail an
      accountInfo.innerHTML = `
        <p><strong>Name:</strong> ${name || ''}</p>
        <p><strong>Email:</strong> ${email || ''}</p>
        <p>UserID: ${userId}</p>
      `;
    }
  }

  // --- Update-Form (PUT /api/users/{userId}) ---
  const updateForm = document.getElementById('update-account-form');
  if (updateForm) {
    updateForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const userId = localStorage.getItem('userId');
      if (!userId) {
        alert("Nicht eingeloggt? Bitte neu einloggen.");
        return;
      }

      const newEmail = document.getElementById('new-email').value.trim();
      const newPassword = document.getElementById('new-password').value.trim();
      const updateResultEl = document.getElementById('update-result');

      if (!newEmail && !newPassword) {
        updateResultEl.textContent = "Bitte zumindest E-Mail oder Passwort ausfüllen.";
        updateResultEl.style.color = "red";
        return;
      }

      try {
        const response = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: newEmail || undefined,
            password: newPassword || undefined
          })
        });
        const data = await response.json();

        if (data.success) {
          updateResultEl.textContent = "Account-Daten erfolgreich aktualisiert!";
          updateResultEl.style.color = "green";

          // Wenn email geändert wurde, localStorage updaten
          if (data.updatedEmail) {
            localStorage.setItem('userEmail', data.updatedEmail);
          }

          // Felder leeren
          document.getElementById('new-email').value = "";
          document.getElementById('new-password').value = "";
        } else {
          updateResultEl.textContent = `Fehler: ${data.message}`;
          updateResultEl.style.color = "red";
        }
      } catch (error) {
        updateResultEl.textContent = `Server-Fehler: ${error}`;
        updateResultEl.style.color = "red";
      }
    });
  }

  // --- Logout ---
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      window.location.href = "index.html";
    });
  }
});
