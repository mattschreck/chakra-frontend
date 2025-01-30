// js/main.js
document.addEventListener('DOMContentLoaded', () => {
  // 1) Backend-URL flexibel setzen
  const BACKEND_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : 'https://chakra-backend-3783b443f623.herokuapp.com'; // Heroku-Backend
  
  // 2) userId aus localStorage lesen
  //    => Damit wir GET/POST nur auf "/api/exercises/{userId}" machen können
  const userId = localStorage.getItem('userId');
  
  // 3) Prüfen, ob userId vorhanden ist
  //    Falls nicht, ist vermutlich niemand eingeloggt
  //    => Du könntest optional einen Redirect machen:
  if (!userId) {
    // alert("Bitte erst einloggen!"); 
    // window.location.href = "login.html";
    // oder du machst einfach weiter – je nach gewünschtem Verhalten
  }

  // 4) FullCalendar-Setup
  const calendarEl = document.getElementById('calendar');
  let calendar;

  if (calendarEl) {
    calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      locale: 'de',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,listWeek'
      },
      // Hole Events vom Backend -> Nur für diesen userId
      events: {
        url: `${BACKEND_URL}/api/exercises/${userId}`,  // <--- userId in URL
        method: 'GET',
        failure: () => {
          alert('Fehler beim Laden der Events vom Backend!');
        }
      },
      eventContent: function (info) {
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
  }

  // 5) Formular zum Hinzufügen neuer Übungen
  const exerciseForm = document.getElementById('exercise-form');
  if (exerciseForm) {
    exerciseForm.addEventListener('submit', async (e) => {
      e.preventDefault();

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
        // POST an "/api/exercises/{userId}"
        const response = await fetch(`${BACKEND_URL}/api/exercises/${userId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEvent)
        });
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        // Falls alles OK, Kalender neu laden
        if (calendar) {
          calendar.refetchEvents();
        }
        // Formular zurücksetzen
        exerciseForm.reset();
      } catch (err) {
        console.error('Fehler beim Anlegen einer Übung:', err);
        alert('Konnte die neue Übung nicht speichern!');
      }
    });
  }
});