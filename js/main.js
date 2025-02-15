// js/main.js
document.addEventListener('DOMContentLoaded', () => {
  // 1) Backend-URL flexibel setzen
  const BACKEND_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://chakra-backend-3783b443f623.herokuapp.com';

  // 2) userId aus localStorage lesen
  const userId = localStorage.getItem('userId');

  // 3) Element-Referenzen
  const calendarEl = document.getElementById('calendar');
  const exerciseForm = document.getElementById('exercise-form');

  // =======================
  // A) FullCalendar / Trainingsplan
  // =======================
  if (calendarEl) {
    // Wenn nicht eingeloggt -> Hinweis
    if (!userId) {
      calendarEl.innerHTML = `
        <div class="bg-red-100 text-red-700 p-4 rounded">
          Bitte logge dich ein oder registriere dich, um deinen persönlichen Trainingsplan zu sehen.
        </div>
      `;
    } else {
      // Eingeloggt -> FullCalendar aufsetzen
      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'de',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,listWeek'
        },
        // EVENTS laden
        events: {
          url: `${BACKEND_URL}/api/exercises/${userId}`,
          method: 'GET',
          failure: () => {
            alert('Fehler beim Laden der Events vom Backend!');
          }
        },
        // Darstellung der Events (title, extendedProps)
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
        },
        // NEU: Klick auf ein Event -> Löschen
        eventClick: async (info) => {
          // FullCalendar nimmt "id" aus deinem JSON => info.event.id
          const exerciseId = info.event.id;
          const eventTitle = info.event.title;

          // Sicherheitsabfrage
          const confirmDel = confirm(`Möchten Sie "${eventTitle}" wirklich löschen?`);
          if (!confirmDel) return;

          try {
            // DELETE /api/exercises/{userId}/{exerciseId}
            const deleteUrl = `${BACKEND_URL}/api/exercises/${userId}/${exerciseId}`;
            const response = await fetch(deleteUrl, {
              method: 'DELETE'
            });
            if (!response.ok) {
              throw new Error(`Server error: ${response.status}`);
            }
            const data = await response.json();
            if (data.success) {
              // Erfolg -> Kalender neu laden
              calendar.refetchEvents();
            } else {
              alert('Fehler beim Löschen: ' + data.message);
            }
          } catch (err) {
            console.error('Löschfehler:', err);
            alert('Konnte nicht löschen!');
          }
        }
      });

      calendar.render();

      // Formular zum Hinzufügen neuer Übungen
      if (exerciseForm) {
        exerciseForm.addEventListener('submit', async (e) => {
          e.preventDefault();

          // Falls localStorage sich geändert hat
          if (!userId) {
            alert("Bitte logge dich ein, um eine Übung hinzuzufügen!");
            return;
          }

          const title = document.getElementById('ex-title').value.trim();
          const date = document.getElementById('ex-date').value;
          const weight = parseInt(document.getElementById('ex-weight').value, 10);
          const repetitions = parseInt(document.getElementById('ex-repetitions').value, 10);
          const sets = parseInt(document.getElementById('ex-sets').value, 10);

          // Neues Event-Objekt (Exercise)
          const newEvent = { 
            title, 
            start: date, 
            weight, 
            repetitions, 
            sets 
          };

          try {
            // POST /api/exercises/{userId}
            const response = await fetch(`${BACKEND_URL}/api/exercises/${userId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newEvent)
            });
            if (!response.ok) {
              throw new Error(`Server error: ${response.status}`);
            }
            // Erfolg -> Kalender neu laden
            calendar.refetchEvents();
            // Formular leeren
            exerciseForm.reset();
          } catch (err) {
            console.error('Fehler beim Anlegen einer Übung:', err);
            alert('Konnte die neue Übung nicht speichern!');
          }
        });
      }
    }
  } 
  // Falls es eine Seite ohne #calendar gibt, aber nur ein Formular
  else if (exerciseForm) {
    if (!userId) {
      alert("Bitte logge dich ein oder registriere dich, um Übungen hinzuzufügen!");
      return;
    }
    // ... analog ...
  }

  // =======================
  // B) WETTER-WIDGET
  // =======================
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
      weatherError.textContent = '';
      weatherWidget.classList.add('hidden');

      try {
        // GET /api/weather?city=...
        const response = await fetch(`${BACKEND_URL}/api/weather?city=${city}`);
        if (!response.ok) {
          throw new Error(`Fehler vom Backend: ${response.status}`);
        }
        const data = await response.json();

        if (data.error) {
          weatherError.textContent = 'Fehler: ' + data.error;
          weatherError.style.color = 'red';
        } else {
          // Icon, Temperatur, Beschreibung, Stadt
          const iconCode = data.icon;
          const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
          weatherIcon.src = iconUrl;

          weatherTemp.textContent = data.temperature.toFixed(1) + ' °C';
          weatherDesc.textContent = data.description;
          weatherCityResult.textContent = data.city;

          weatherWidget.classList.remove('hidden');
        }
      } catch (err) {
        weatherError.textContent = 'Konnte Wetter nicht laden: ' + err.message;
        weatherError.style.color = 'red';
      }
    });
  }
});
