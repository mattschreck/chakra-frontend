// js/main.js
document.addEventListener('DOMContentLoaded', () => {
  // 1) Backend-URL flexibel setzen
  const BACKEND_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://chakra-backend-3783b443f623.herokuapp.com'; // Heroku-Backend

  // 2) userId aus localStorage lesen
  const userId = localStorage.getItem('userId');

  // 3) FullCalendar & Formular nur auf trainingsplan.html
  const calendarEl = document.getElementById('calendar');
  const exerciseForm = document.getElementById('exercise-form');

  // ==============
  // A) KALENDER
  // ==============
  if (calendarEl) {
    // Prüfen, ob eingeloggt
    if (!userId) {
      // Nicht eingeloggt -> Kein Request an Backend
      // Zeige eine Info statt des Kalenders
      calendarEl.innerHTML = `
        <div class="bg-red-100 text-red-700 p-4 rounded">
          Bitte logge dich ein oder registriere dich, um deinen persönlichen Trainingsplan zu sehen.
        </div>
      `;
    } else {
      // Eingeloggt -> FullCalendar initialisieren
      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'de',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,listWeek'
        },
        // Lade nur die Übungen für diesen User
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

      // Falls ein Formular existiert, ermöglichen wir das Hinzufügen
      if (exerciseForm) {
        exerciseForm.addEventListener('submit', async (e) => {
          e.preventDefault();

          // Letzter Check: Falls localStorage sich geändert hat
          if (!userId) {
            alert("Bitte logge dich ein, um eine Übung hinzuzufügen!");
            return;
          }

          const title = document.getElementById('ex-title').value.trim();
          const date = document.getElementById('ex-date').value;
          const weight = parseInt(document.getElementById('ex-weight').value, 10);
          const repetitions = parseInt(document.getElementById('ex-repetitions').value, 10);
          const sets = parseInt(document.getElementById('ex-sets').value, 10);

          // Neues Event-Objekt
          const newEvent = {
            title,
            start: date,
            weight,
            repetitions,
            sets
          };

          try {
            // POST an /api/exercises/{userId}
            const response = await fetch(`${BACKEND_URL}/api/exercises/${userId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newEvent)
            });
            if (!response.ok) {
              throw new Error(`Server error: ${response.status}`);
            }
            // Kalender aktualisieren
            calendar.refetchEvents();

            // Formular zurücksetzen
            exerciseForm.reset();
          } catch (err) {
            console.error('Fehler beim Anlegen einer Übung:', err);
            alert('Konnte die neue Übung nicht speichern!');
          }
        });
      }
    }
  }

  // ==============
  // B) Nur Formular, kein Calendar
  // (Falls du z. B. ein anderes Layout hast)
  // ==============
  else if (exerciseForm) {
    // Falls es eine Seite gibt, auf der nur das Formular ist, aber kein #calendar
    if (!userId) {
      alert("Bitte logge dich ein oder registriere dich, um Übungen hinzuzufügen!");
      // Optional: Redirect
      // window.location.href = "login.html";
      return;
    }
    exerciseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      // Gleiche Logik wie oben
    });
  }
});