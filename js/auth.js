document.addEventListener('DOMContentLoaded', () => {
  const BACKEND_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://chakra-backend-3783b443f623.herokuapp.com';

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
        } catch (err) {
          resultEl.textContent = `Server-Fehler: ${err}`;
          resultEl.style.color = "red";
        }
      });
    }

  // Login
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
          if (data.name) localStorage.setItem('userName', data.name);
          if (data.email) localStorage.setItem('userEmail', data.email);
          setTimeout(() => {
            window.location.href = "index.html";
          }, 1000);
        } else {
          resultEl.textContent = `Fehler: ${data.message}`;
          resultEl.style.color = "red";
        }
      } catch (err) {
        resultEl.textContent = `Server-Fehler: ${err}`;
        resultEl.style.color = "red";
      }
    });
  }

  // Account-Seite
  const accountInfo = document.getElementById('account-info');
  if (accountInfo) {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const name = localStorage.getItem('userName');
    const email = localStorage.getItem('userEmail');

    if (!token || !userId) {
      window.location.href = "index.html";
    } else {
      accountInfo.innerHTML = `
        <p class="mb-2"><strong>Name:</strong> ${name || ''}</p>
        <p class="mb-2"><strong>Email:</strong> ${email || ''}</p>
        <p class="text-sm text-gray-400">UserID: ${userId}</p>
      `;
    }

    // -- E-Mail ändern: Button und Formular
    const btnShowEmailEdit = document.getElementById('btn-show-email-edit');
    const emailEditForm = document.getElementById('email-edit-form');
    const emailEditResult = document.getElementById('email-edit-result');

    btnShowEmailEdit?.addEventListener('click', () => {
      // Toggle hidden
      emailEditForm.classList.toggle('hidden');
      emailEditResult.textContent = '';
    });

    emailEditForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newEmail = document.getElementById('new-email').value.trim();
      if (!newEmail) {
        emailEditResult.textContent = "Bitte eine neue E-Mail eingeben.";
        emailEditResult.style.color = "red";
        return;
      }
      try {
        const response = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: newEmail })
        });
        const data = await response.json();
        if (data.success) {
          emailEditResult.textContent = "E-Mail erfolgreich geändert!";
          emailEditResult.style.color = "green";

          // LocalStorage updaten
          if (data.updatedEmail) {
            localStorage.setItem('userEmail', data.updatedEmail);
          }
          // Zur Anzeige aktualisieren
          accountInfo.innerHTML = `
            <p class="mb-2"><strong>Name:</strong> ${name || ''}</p>
            <p class="mb-2"><strong>Email:</strong> ${data.updatedEmail || ''}</p>
            <p class="text-sm text-gray-400">UserID: ${userId}</p>
          `;
        } else {
          emailEditResult.textContent = `Fehler: ${data.message}`;
          emailEditResult.style.color = "red";
        }
      } catch (err) {
        emailEditResult.textContent = `Server-Fehler: ${err}`;
        emailEditResult.style.color = "red";
      }
    });

    // -- Passwort ändern: Button und Formular
    const btnShowPwEdit = document.getElementById('btn-show-pw-edit');
    const pwEditForm = document.getElementById('pw-edit-form');
    const pwEditResult = document.getElementById('pw-edit-result');

    btnShowPwEdit?.addEventListener('click', () => {
      pwEditForm.classList.toggle('hidden');
      pwEditResult.textContent = '';
    });

    pwEditForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPassword = document.getElementById('new-password').value.trim();
      if (!newPassword) {
        pwEditResult.textContent = "Bitte ein neues Passwort eingeben.";
        pwEditResult.style.color = "red";
        return;
      }
      try {
        const response = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: newPassword })
        });
        const data = await response.json();
        if (data.success) {
          pwEditResult.textContent = "Passwort erfolgreich geändert!";
          pwEditResult.style.color = "green";
        } else {
          pwEditResult.textContent = `Fehler: ${data.message}`;
          pwEditResult.style.color = "red";
        }
      } catch (err) {
        pwEditResult.textContent = `Server-Fehler: ${err}`;
        pwEditResult.style.color = "red";
      }
    });
  }

  // Logout
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
