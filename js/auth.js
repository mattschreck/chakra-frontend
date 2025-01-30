// js/auth.js
document.addEventListener('DOMContentLoaded', () => {
  const BACKEND_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://chakra-backend-3783b443f623.herokuapp.com';

  // Registrierung
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
        <p><strong>Name:</strong> ${name || ''}</p>
        <p><strong>Email:</strong> ${email || ''}</p>
        <p>UserID: ${userId}</p>
      `;
    }
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