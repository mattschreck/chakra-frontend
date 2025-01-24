// js/nav.js

document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Prüfe Login-Status
  const token = localStorage.getItem('authToken');
  const userName = localStorage.getItem('userName');  // Neu
  // const userEmail = localStorage.getItem('userEmail'); // falls du es brauchst

  // Baue HTML für die Navbar (Desktop + Mobile)
  // Struktur: <Logo> <Mitte: Trainingsplan> <Rechts: Login/Register ODER Account/Logout>
  let navHtml = `
    <div class="max-w-screen-2xl mx-auto px-4 flex items-center justify-between py-4">
      <!-- Logo links -->
      <a href="index.html">
        <img src="images/chakra-logo.png" alt="Chakra Logo" class="h-8 w-auto" />
      </a>

      <!-- MITTE: Nur Trainingsplan-Link -->
      <ul class="hidden lg:flex space-x-6">
        <li>
          <a href="trainingsplan.html" class="text-gray-600 hover:text-green-500">
            Trainingsplan
          </a>
        </li>
      </ul>

      <!-- RECHTS: abhängig vom Login-Status -->
      <ul class="hidden lg:flex space-x-6">
  `;

  if (!token) {
    // NICHT EINGELOGGT
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
    // EINGELOGGT => Account-Button + Logout
    // Optional: userName anzeigen
    navHtml += `
      <li>
        <a href="account.html" class="flex items-center text-gray-600 hover:text-green-500">
          <img src="images/person.svg" alt="Account" class="h-5 w-5 mr-2" />
          Account
        </a>
      </li>
      <li>
        <button id="nav-logout" class="text-red-500 border border-red-500 px-4 py-2 rounded-md hover:bg-red-500 hover:text-white">
          Logout
        </button>
      </li>
    `;
  }

  navHtml += `</ul>
      <!-- Hamburger -->
      <button id="menu-toggle" class="lg:hidden text-gray-600 hover:text-green-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6"
             fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round"
                stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
    <!-- Mobile Menu -->
    <div id="mobile-menu" class="hidden fixed inset-0 bg-white shadow-md px-4 py-8">
      <div class="flex items-center justify-between mb-6">
        <a href="index.html">
          <img src="images/chakra-logo.png" alt="Chakra Logo" class="h-8 w-auto" />
        </a>
        <button id="menu-close" class="text-gray-600 hover:text-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round"
                  stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <ul class="space-y-4 mb-4">
        <li>
          <a href="trainingsplan.html" class="block text-gray-600 hover:text-green-500 text-lg">
            Trainingsplan
          </a>
        </li>
  `;

  if (!token) {
    // NICHT EINGELOGGT - MOBILE
    navHtml += `
        <li>
          <a href="login.html" class="block text-black border border-gray-300 text-center rounded-md py-2">
            Login
          </a>
        </li>
        <li>
          <a href="register.html" class="block text-white bg-green-500 text-center rounded-md py-2">
            Register
          </a>
        </li>
    `;
  } else {
    // EINGELOGGT - MOBILE
    navHtml += `
        <li>
          <a href="account.html" class="flex items-center text-gray-600 hover:text-green-500 text-lg">
            <img src="images/person.svg" alt="Account" class="h-5 w-5 mr-2" />
            Account
          </a>
        </li>
        <li>
          <button id="mobile-logout" class="block w-full text-red-500 border border-red-500 text-center rounded-md py-2 mt-2">
            Logout
          </button>
        </li>
    `;
  }

  navHtml += `
      </ul>
    </div>
  `;

  navbar.innerHTML = navHtml;

  // Mobile-Menu Toggle
  const menuButton = document.getElementById('menu-toggle');
  const menuCloseButton = document.getElementById('menu-close');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuButton) {
    menuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
  if (menuCloseButton) {
    menuCloseButton.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  }

  // Logout-Button (Desktop)
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

  // Logout-Button (Mobile)
  const mobileLogout = document.getElementById('mobile-logout');
  if (mobileLogout) {
    mobileLogout.addEventListener('click', () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      window.location.href = "index.html";
    });
  }
});
