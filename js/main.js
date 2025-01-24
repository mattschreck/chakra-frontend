// main.js
document.addEventListener('DOMContentLoaded', () => {
  // Backend-URL flexibel setzen
  const BACKEND_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://chakra-backend-3783b443f623.herokuapp.com'; // Heroku-Backend-URL

  // Falls du ein Kalender-Element hast
  const calendarEl = document.getElementById('calendar');
  let calendar;

  if (calendarEl) {
    // FullCalendar Setup
    calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      locale: 'de',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,listWeek'
      },
      // Hole Events vom Backend
      events: {
        url: `${BACKEND_URL}/api/exercises`,
        method: 'GET',
        failure: () => {
          alert('Fehler beim Laden der Events vom Backend!');
        }
      }
    });
    calendar.render();
  }

  // Falls ein Übungs-Formular existiert
  const exerciseForm = document.getElementById('exercise-form');
  if (exerciseForm) {
    exerciseForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = document.getElementById('ex-title').value.trim();
      const date = document.getElementById('ex-date').value;
      const weight = parseInt(document.getElementById('ex-weight').value, 10);
      const repetitions = parseInt(document.getElementById('ex-repetitions').value, 10);
      const sets = parseInt(document.getElementById('ex-sets').value, 10);

      // Format für dein Backend/FullCalendar
      const newEvent = {
        title,
        start: date,
        weight,
        repetitions,
        sets
      };

      try {
        const response = await fetch(`${BACKEND_URL}/api/exercises`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEvent)
        });
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        // Kalender neu laden
        calendar.refetchEvents();
        exerciseForm.reset();
      } catch (err) {
        console.error('Fehler beim Anlegen einer Übung:', err);
        alert('Konnte die neue Übung nicht speichern!');
      }
    });
  }
});
