// js/nav.js
document.addEventListener('DOMContentLoaded', () => {
  // Backend-URL flexibel setzen
  const BACKEND_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://chakra-backend-3783b443f623.herokuapp.com'; // Heroku-Backend

  // --- Navbar ---
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const token = localStorage.getItem('authToken');

    let navHtml = `
      <div class="max-w-screen-2xl mx-auto px-4 flex items-center justify-between py-4">
        <!-- Logo -->
        <a href="index.html">
          <img src="images/chakra-logo.png" alt="Chakra Logo" class="h-8 w-auto" />
        </a>

        <!-- Mitte: Trainingsplan -->
        <ul class="hidden lg:flex space-x-6">
          <li>
            <a href="trainingsplan.html" class="text-gray-600 hover:text-green-500">
              Trainingsplan
            </a>
          </li>
        </ul>

        <!-- Rechts: Login/Register oder Account/Logout -->
        <ul class="hidden lg:flex space-x-6 items-center">
    `;

    if (!token) {
      // Nicht eingeloggt: Login + Register
      navHtml += `
        <li>
          <a href="login.html" class="text-gray-600 border border-gray-300 px-4 py-2 rounded-md hover:text-green-500">
            Login
          </a>
        </li>
        <li>
          <a href="register.html" class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
            Register
          </a>
        </li>
      `;
    } else {
      // Eingeloggt: Account-Symbol + Logout
      navHtml += `
        <li>
          <a href="account.html" class="text-gray-600 hover:text-green-500">
            <img src="images/person.svg" alt="Account" class="h-6 w-6" />
          </a>
        </li>
        <li>
          <button id="nav-logout" class="text-red-500 border border-red-500 px-4 py-2 rounded-md hover:bg-red-500 hover:text-white">
            Logout
          </button>
        </li>
      `;
    }

    navHtml += `
        </ul>
        <!-- Hamburger-Menü (mobil) -->
        <button id="menu-toggle" class="lg:hidden text-gray-600 hover:text-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round"
                  stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    `;

    navbar.innerHTML = navHtml;

    // Logout
    const logoutBtn = document.getElementById('nav-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        window.location.href = "index.html";
      });
    }
  }

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

          // Weiter zur Startseite
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

  // --- Account-Seite ---
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
  }
});