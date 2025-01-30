// js/main.js
document.addEventListener('DOMContentLoaded', () => {
  const BACKEND_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://chakra-backend-3783b443f623.herokuapp.com';

  // ====== Trainingsplan & FullCalendar ======
  const userId = localStorage.getItem('userId');
  const calendarEl = document.getElementById('calendar');
  const exerciseForm = document.getElementById('exercise-form');

  if (calendarEl) {
    if (!userId) {
      // Nicht eingeloggt
      calendarEl.innerHTML = `
        <div class="bg-red-100 text-red-700 p-4 rounded">
          Bitte logge dich ein oder registriere dich, um deinen persönlichen Trainingsplan zu sehen.
        </div>
      `;
    } else {
      // Eingeloggt -> FullCalendar Setup
      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'de',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,listWeek'
        },
        events: {
          url: `${BACKEND_URL}/api/exercises/${userId}`,
          method: 'GET',
          failure: () => {
            alert('Fehler beim Laden der Events vom Backend!');
          }
        },
        eventContent: (info) => {
          const { title, extendedProps } = info.event;
          return {
            html: `
              <div>
                <strong>${title}</strong><br />
                Gewicht: ${extendedProps.weight} kg<br />
                Sätze: ${extendedProps.sets}<br />
                Wiederholungen: ${extendedProps.repetitions}
              </div>
            `
          };
        }
      });
      calendar.render();

      // Formular -> Neue Übung
      if (exerciseForm) {
        exerciseForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          if (!userId) {
            alert("Bitte logge dich ein, um eine Übung hinzuzufügen!");
            return;
          }

          const title = document.getElementById('ex-title').value.trim();
          const date = document.getElementById('ex-date').value;
          const weight = parseInt(document.getElementById('ex-weight').value, 10);
          const repetitions = parseInt(document.getElementById('ex-repetitions').value, 10);
          const sets = parseInt(document.getElementById('ex-sets').value, 10);

          const newEvent = { title, start: date, weight, repetitions, sets };

          try {
            const response = await fetch(`${BACKEND_URL}/api/exercises/${userId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newEvent)
            });
            if (!response.ok) {
              throw new Error(`Server error: ${response.status}`);
            }
            calendar.refetchEvents();
            exerciseForm.reset();
          } catch (err) {
            console.error('Fehler beim Anlegen einer Übung:', err);
            alert('Konnte die neue Übung nicht speichern!');
          }
        });
      }
    }
  } else if (exerciseForm) {
    // Falls andere Seite
    // ...
  }


  // ====== WETTER-WIDGET ======
  const loadWeatherBtn = document.getElementById('load-weather-btn');
  const weatherCityInput = document.getElementById('weather-city');
  const weatherWidget = document.getElementById('weather-widget');
  const weatherIcon = document.getElementById('weather-icon');
  const weatherTemp = document.getElementById('weather-temp');
  const weatherDesc = document.getElementById('weather-desc');
  const weatherCityResult = document.getElementById('weather-city-result');
  const weatherError = document.getElementById('weather-error');

  if (loadWeatherBtn && weatherCityInput && weatherWidget) {
    loadWeatherBtn.addEventListener('click', async () => {
      const city = weatherCityInput.value.trim() || 'Berlin';
      weatherError.textContent = ''; // evtl. alten Error löschen
      weatherWidget.classList.add('hidden'); // Widget ausblenden, bis neue Daten da sind

      try {
        // GET /api/weather?city=...
        const response = await fetch(`${BACKEND_URL}/api/weather?city=${city}`);
        if (!response.ok) {
          throw new Error(`Fehler vom Backend: ${response.status}`);
        }
        const data = await response.json();

        // data: {"city":"Berlin","temperature":12.34,"description":"few clouds","icon":"02d"}
        if (data.error) {
          weatherError.textContent = 'Fehler: ' + data.error;
          weatherError.style.color = 'red';
        } else {
          // Setze Icon
          const iconCode = data.icon; // z.B. "02d"
          const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
          weatherIcon.src = iconUrl;

          // Temperatur
          weatherTemp.textContent = data.temperature.toFixed(1) + ' °C';
          // Beschreibung
          weatherDesc.textContent = data.description;
          // Stadt
          weatherCityResult.textContent = data.city;

          // Widget sichtbar machen
          weatherWidget.classList.remove('hidden');
        }
      } catch (err) {
        weatherError.textContent = 'Konnte Wetter nicht laden: ' + err.message;
        weatherError.style.color = 'red';
      }
    });
  }
});